import QRCode from 'qrcode';

const url = 'https://getguestspot.app/#/store-redirect';

QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2
}, (err, svg) => {
  if (err) throw err;
  console.log(svg);
});
