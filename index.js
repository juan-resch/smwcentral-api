const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const PORT = 8000
const pages = 2
const url = `https://www.smwcentral.net/?p=section&s=smwhacks&u=0&g=0&n=`

const { JSONStorage } = require('node-localstorage')

const storage = new JSONStorage('./')

const app = express();

app.use(express.json());

app.get('/smw_hacks', async (req, res) => {
  let data = await get_smw_games();
  storage.setItem('smw_hacks_1_at_' + pages + '.json', data);
  res.send(data)
})

const get_smw_games = async () => {
  var data = [];

  for(let index = 1 ; index <= pages ; index++){

    var data_ = [];

    await axios(url+index).then(response => {
      const html = response.data
      const $ = cheerio.load(html)
    
      $('#list_content', html).each(function() {
        const rows = $(this).find('table').find('tbody').find('tr').toArray();
    
        for(let i = 0 ; i < rows.length ; i++){
          let tds = $(rows[i]).find('td').toArray()
  
          var links = $(tds[5]).find('a').toArray().map((a) => $(a).attr('href'));
          
          links = links.map(link => 'https://www.smwcentral.net' + link)
  
          var autores = $(tds[5]).find('a').toArray().map((a) => $(a).text().trim());
  
          autores = autores.map((autor, index) => ({name: autor, link: links[index]}))
  
          let row = {
            name: $(tds[0]).find('a').text(),
            added: $(tds[0]).find('time').text(),
            demo: $(tds[1]).text().trim(),
            featured: $(tds[2]).text().trim(),
            exits: $(tds[3]).text().trim(),
            type: $(tds[4]).text().trim(),
            authors: autores,
            rating: $(tds[6]).text().trim(),
            size: $(tds[7]).text().trim(),
            download_link: 'https:' + $(tds[8]).find('a').attr('href').trim(),
            downloads: $(tds[8]).find('span').text().trim()
          }
          
          data_.push(row)
        }
        data_ = data_.slice(1, data_.length)
        if(data){
          data = [...data, ...data_]
        } else {
          data = data_
        }
        
      })
    }).catch(err => {
      console.log(err)
    });
  }
  return(data)
}

app.listen(PORT, () => {
  console.log(`Server on PORT: ${PORT}`)
});