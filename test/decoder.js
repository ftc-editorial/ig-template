const urls = [
  'https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fs3-eu-west-1.amazonaws.com%2Fft-shorthand-prod-eu%2Fgrowing-pains%2Fmedia%2Farmani_highres_gsquarci_01_2-lr.jpg?source=commercial-content-lambda',
  'https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fs3-eu-west-1.amazonaws.com%2Fft-shorthand-prod-eu%2Fgrowing-pains%2Fmedia%2Farmani_highres_gsquarci_01_2-mr.jpg?source=commercial-content-lambda',
  'https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fs3-eu-west-1.amazonaws.com%2Fft-shorthand-prod-eu%2Fgrowing-pains%2Fmedia%2Farmani_highres_gsquarci_01_2-hr.jpg?source=commercial-content-lambda',
  'https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fs3-eu-west-1.amazonaws.com%2Fft-shorthand-prod-eu%2Fgrowing-pains%2Fmedia%2Fbmgf_logo_white_use-this.png?source=commercial-content-lambda'
];

function decode(urls) {
  return urls.map(url => {
    return decodeURIComponent(url);
  });
}

console.log(decode(urls));
