// 'import' ki jagah 'require' use karo
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { model } = req.query;

  if (!model) {
    return res.status(400).json({ status: "error", message: "Model name missing" });
  }

  try {
    const searchUrl = `https://www.gsmarena.com/res.php3?sSearch=${encodeURIComponent(model)}`;
    const { data: searchData } = await axios.get(searchUrl);
    const $ = cheerio.load(searchData);
    
    const firstResult = $('.makers li a').first().attr('href');
    if (!firstResult) return res.status(404).json({ status: "error", message: "Phone nahi mila" });

    const phoneUrl = `https://www.gsmarena.com/${firstResult}`;
    const { data: phoneData } = await axios.get(phoneUrl);
    const $$ = cheerio.load(phoneData);

    let fullSpecs = {};
    $$('#specs-list table').each((i, table) => {
      const section = $$(table).find('th').text();
      fullSpecs[section] = {};
      $$(table).find('tr').each((j, tr) => {
        const key = $$(tr).find('.ttl').text().trim();
        const value = $$(tr).find('.nfo').text().trim();
        if (key) fullSpecs[section][key] = value;
      });
    });

    return res.status(200).json({
      status: "success",
      phone_name: $$('.specs-phone-name-title').text(),
      specs: fullSpecs
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
