const cheerio = require("cheerio");
const axios = require("axios");

function getPhotoUrl(part) {
	return part.children[1].children[0].children[0].attribs['data-src'];
}

function getUrl(part) {
	return part.children[0].children[0].children[1].children[0].attribs["href"]
}

function getTitle(part) {
	return part.children[0].children[0].children[1].children[0].children[0].data
}

async function getText(urlPage) {
	let text;
	await axios.get(urlPage).then(response => {
		const $ = cheerio.load(response.data);
		let article = $(".c-article").find(".c-article__body").find("p").text();
		text = article.slice(0,500) + "...";
	})
	return text;
}


exports.tsnParse = function (response, allNewsBlock, getCode) {
	const $ = cheerio.load(response.data);
	let newsArray =  ($(".u-hide--sdmd > div").find(".c-section"));

	let trueAccessSection = [6,2,0];

	trueAccessSection.forEach((number) => {
		let newsBlock = newsArray[number].children[1].children;
		for(let iNews=0; iNews < newsBlock.length; iNews++) {
			let instanceLive = false;

			if (number == 0 && iNews == newsBlock.length-1) {return;}



			let part = newsBlock[iNews].children[0];
			let titleNews = getTitle(part);

			getText(getUrl(part)).then(data => {
				allNewsBlock.forEach(news => {if (news.code == getCode(titleNews)) {instanceLive = true}});
				if (!instanceLive) {
					allNewsBlock.push({title: titleNews, text:data, photoUrl: getPhotoUrl(part), url: getUrl(part), code: getCode(titleNews), published: false});
				}
			})
		}
	})
}