const cheerio = require("cheerio");
const axios = require("axios");

function getPhotoUrl(part) {
	return part.children[1].children[1].attribs.src;
}

function getUrl(part) {
	return part.children[1].attribs.href;
}

function getTitle(part) {
	return part.children[3].children[1].attribs.title;
}

function getText(part) {
	return part.children[5].children[0].data;
}


exports.censorParse = function (response, allNewsBlock, getCode) {
	const $ = cheerio.load(response.data);
	let newsArray =  $(".row").find("#w16").find(".col-12").find(".news-list-item");

	for(let iNews=0; iNews < newsArray.length; iNews++) {
		let instanceLive = false;

		let part = newsArray[iNews];
		let titleNews = getTitle(part);

		allNewsBlock.forEach(news => {if (news.code == getCode(titleNews)) {instanceLive = true}});
		if (!instanceLive) {
			allNewsBlock.push({title: titleNews, text:getText(part), photoUrl: getPhotoUrl(part), url: getUrl(part), code: getCode(titleNews), published: false});
		}
	}
}