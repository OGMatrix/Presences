const presence = new Presence({ clientId: "765261270814949417" }),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let oldLang: string = null,
	strings: LangStrings;

function getMeta(metaName: string): string {
	metaName = `PreMiD_${metaName}`;
	const metas = document.getElementsByTagName("meta");
	for (let i = 0; i < metas.length; i++) {
		if (metas[i].getAttribute("name") === metaName)
			return metas[i].getAttribute("content");
	}
	return "";
}

function hasMeta(metaName: string): boolean {
	metaName = `PreMiD_${metaName}`;
	const metas = document.getElementsByTagName("meta");
	for (let i = 0; i < metas.length; i++)
		if (metas[i].getAttribute("name") === metaName) return true;

	return false;
}

presence.on("UpdateData", async () => {
	const incognito = await presence.getSetting<boolean>("incognito"),
		showTimestamp = await presence.getSetting<boolean>("showTimestamp"),
		showButtons = await presence.getSetting<boolean>("buttons"),
		newLang = await presence.getSetting<string>("lang");
	if (!oldLang || oldLang !== newLang) {
		oldLang = newLang;
		strings = await presence.getStrings(
			{
				docsViewer1: "general.viewing",
				docsViewer2: "premid.docs",
				privacyVisit: "general.browsing",
				details: getMeta("details"),
				state: getMeta("state"),
				smallImageText: getMeta("smallImageText"),
				button1: getMeta("button_1_Label"),
				button2: getMeta("button_2_Label")
			},
			oldLang
		);
	}

	const presenceData: PresenceData = {
		largeImageKey: "img_logo"
	};

	if (showTimestamp === true) presenceData.startTimestamp = browsingTimestamp;

	if (incognito === false) {
		if (
			["voidbots.net", "beta.voidbots.net"].includes(window.location.hostname)
		) {
			if (hasMeta("details"))
				presenceData.details = strings.details || getMeta("details");
			if (hasMeta("state"))
				presenceData.state = strings.state || getMeta("state");
			if (hasMeta("smallImageKey"))
				presenceData.smallImageKey = getMeta("smallImageKey");
			if (hasMeta("smallImageText")) {
				presenceData.smallImageText =
					strings.smallImageText || getMeta("smallImageText");
			}
			if (hasMeta("largeImageKey"))
				presenceData.largeImageKey = getMeta("largeImageKey");
			if (showButtons === true) {
				if (
					(hasMeta("button_1_Label") && hasMeta("button_1_Url")) ||
					(hasMeta("button_2_Label") && hasMeta("button_2_Url"))
				)
					delete presenceData.buttons;
				if (hasMeta("button_1_Label") && hasMeta("button_1_Url")) {
					presenceData.buttons.push({
						label: getMeta("button_1_Label"),
						url: getMeta("button_1_Url")
					});
				}
				if (hasMeta("button_2_Label") && hasMeta("button_2_Url")) {
					presenceData.buttons.push({
						label: getMeta("button_2_Label"),
						url: getMeta("button_2_Url")
					});
				}
			}
		} else if (window.location.hostname === "docs.voidbots.net") {
			presenceData.details = `${strings.docsViewer1.slice(
				0,
				-1
			)} ${strings.docsViewer2.toLowerCase()}:`;
			presenceData.smallImageKey = "img_icon_code";
			presenceData.smallImageText = "Confusion 100";
			presenceData.state =
				document.querySelector("title").textContent || "Home";
		}
	} else presenceData.details = strings.privacyVisit;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

interface LangStrings {
	docsViewer1: string;
	docsViewer2: string;
	privacyVisit: string;
	details: string;
	state: string;
	smallImageText: string;
	button1: string;
	button2: string;
}
