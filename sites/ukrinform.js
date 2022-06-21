const cheerio = require("cheerio");
const axios = require("axios");

function getPhotoUrl(part) {
	return part.children[1].children[0].next.attribs["src"];
}

function getUrl(part) {
	return part.children[1].attribs["href"];
}

function getTitle(part) {
	return part.children[6].next.children[0].children[0].data;
}

async function getText(urlPage) {
	let text;
	await axios.get(urlPage).then(response => {
		const $ = cheerio.load(response.data);
		let article = $(".newsHolderContainer").find(".newsText").find("p").text();
		text = article.slice(0,500) + "...";
	})
	return text;
}

exports.ukrinformParse = function (response, allNewsBlock, getCode) {
	const $ = cheerio.load(response.data);
	let newsArray = $(".infinite-scroll > .analiticBody");
	for(let iNews=1; iNews < newsArray[0].children.length-20; iNews += 2) {
		let part = newsArray[0].children[iNews];

		let urlPage;
		if (getUrl(part)[0] == "/") {
			urlPage = "https://www.ukrinform.ua"+getUrl(part);
		} else {urlPage = getUrl(part);}

		let instanceLive = false;

		let titleNews = getTitle(part);
		getText(urlPage).then(data => {
			allNewsBlock.forEach(news => {if (news.code == getCode(titleNews)) {instanceLive = true}});

			if (!instanceLive) {
				allNewsBlock.push({title: titleNews, text: data, photoUrl: getPhotoUrl(part), url: urlPage, code: getCode(titleNews), published: false});
			}
		});
	}
}