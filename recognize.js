import Tesseract from 'tesseract.js';
import { parse } from 'node-html-parser'
import { request } from 'undici'

export async function checkNopol(nopol) {
  async function saveImage(url, cookie) {
    const { body } = await request(url, {
      headers: {
        cookie
      }
    });
    const buffer = await body.arrayBuffer();
    return buffer;
  }

  async function getCaptcha() {
    const { body, headers } = await request(`https://info.dipendajatim.go.id/logic_pkb.php?act=captcha`)
    const imgUrl = 'https://info.dipendajatim.go.id' + (await body.text()).match(/src="([^"]*)"/)[1]
    const cookie = (headers['set-cookie'])
    const buffer = await saveImage(imgUrl, cookie)
    return { cookie, buffer }
  }

  async function recognize(buffer) {
    const res = await Tesseract.recognize(
      buffer,
      'eng',
      // { logger: m => console.log(m) }
    )
    return String(res.data.text).replace('\n', '');
  }

  async function check(props) {
    console.log('Checking', props)
    const { body } = await request("https://info.dipendajatim.go.id/logic_pkb.php?act=cek", {
      "headers": {
        "accept": "*/*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Google Chrome\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": props.cookie,
        "Referer": "https://info.dipendajatim.go.id/index.php?page=info_pkb",
        "Referrer-Policy": "same-origin",
      },
      "body": `nopol=${props.nopol}&code=${props.code}`,
      "method": "POST"
    });
    return await body.text();
  }
  const { cookie, buffer } = await getCaptcha();
  const code = await recognize(buffer);

  const result = JSON.parse(await check({ cookie, nopol, code }))
  if (result.msg) {
    return checkNopol(nopol)
  }

  const dom = parse(result.html);

  let res = {};
  dom.querySelectorAll('tr').map(el => {
    const key = el.firstChild.innerText.toLowerCase().replace(/\s|\//g, '_')
    const value = el.lastChild.innerText
    res[key] = value
  })
  return {
    succes: true,
    copyright:'Drax @2023',
    result: res
  };
}