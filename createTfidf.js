const fs = require('fs');

const createTfidf = () => {
  const contents = fs.readFileSync('./city_data.json', { encoding: 'utf-8' });
  let jsonContents = JSON.parse(contents);

  const intermediateTermToTfs = {};
  const finalTermToRankedTfidfs = {};

  const documentCount = jsonContents.length;
  jsonContents = jsonContents.slice(0,1000);

  jsonContents.forEach((document) => {
    // pull out all values
    // remove punc
    // lowercase
    const locationName = document.name;
    let documentTerms = Object.values(document)
      .filter(section => typeof section === 'string')
      .reduce((terms, section) => {
      return terms.concat(section.split(' ')); // ['a', 'b'], 'c d' => ['a', 'b', 'c', 'd'];
    }, []).map((term) => `_${term}`);
    let documentLength = documentTerms.length;

    const wordCounts = {};
    documentTerms.forEach((term) => {
      wordCounts[term] = wordCounts[term] ? wordCounts[term] + 1 : 1;
    });

    for (let term in wordCounts) {
      const tf = wordCounts[term] / documentLength;
      intermediateTermToTfs[term] = intermediateTermToTfs[term] || { documentsIncluding: 0, tfs: [] };
      intermediateTermToTfs[term].documentsIncluding++;
      try {
        intermediateTermToTfs[term].tfs.push({ name: locationName, score: tf });
      } catch(e) {
        console.error(e);
        console.log(intermediateTermToTfs[term], term);
      }
    }
  });

  for (let term in intermediateTermToTfs) {
    const idf = Math.log(documentCount / intermediateTermToTfs[term].documentsIncluding);
    const sortedTfidfs = intermediateTermToTfs[term].tfs.map((tf) => {
      return {
        name: tf.name,
        score: tf.score * idf
      };
    }).sort((a,b) => b.score - a.score);

    finalTermToRankedTfidfs[term] = sortedTfidfs;
  }

  return finalTermToRankedTfidfs;
}

const search = (searchValue, searchMap) => {
  const searchTerms = searchValue.split(' ').map(term => `_${term}`);
  const finalLocationMap = searchMap[searchTerms[0]].reduce((locMap, curr) => {
    locMap[curr.name] = curr.score;
    return locMap;
  }, {});
  searchTerms.slice(1).forEach((term) => {
    // word
    const tempLocationMap = searchMap[term].reduce((locMap, curr) => {
      locMap[curr.name] = curr.score;
      return locMap;
    }, {});
    for (let location in finalLocationMap) {
      if (!tempLocationMap[location]) {
        delete finalLocationMap[location];
        return;
      }
      finalLocationMap[location] += tempLocationMap[location];
    }
  });
  const rankedResults = [];
  for (let location in finalLocationMap) {
    rankedResults.push({ name: location, score: finalLocationMap[location] });
  }
  return rankedResults.sort((a, b) => b.score - a.score)
    .slice(0,10).map(result => result.name)
}


module.exports = {
  createTfidf,
  search
};
