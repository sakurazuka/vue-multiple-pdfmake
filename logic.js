import html2canvas from "html2canvas";
import pdfMake from "pdfmake/build/pdfmake";

// 72dpi 時の mm => px 換算比
// 計算式は 1/(25.4mm / 72dpi)
const RATE = 2.83464566929;

// A4 210mm x 197mm
const PAGE_WIDTH = 210 * RATE;
const PAGE_HEIGHT = 297 * RATE;

// TODO: 仮置き。後でページ設計に合わせて修正
const CONTENT_WIDTH = 210 * RATE;
const CONTENT_HEIGHT = 297 * RATE;
const PAGE_MARGINS = [0 * RATE, 0 * RATE];

/**
 * HTMLからPDFを生成
 * @param {HTMLElement} element
 */
export async function createPdfFromHtml(element) {
  const pdfContent = await createPdfContent(element);
  createPdf(pdfContent);
}

/**
 * PDF出力用のPdfContentを作成
 * @param {HTMLElement} element
 * @param {boolean} isOnlyQrCode
 * @returns {Array<PdfContent>}
 */
async function createPdfContent(element) {
  const options = {
    // HACK: ブラウザ依存でcanvasサイズが変わらないように、scaleは固定値。IEでのぼやけ対策で十分大きめの2にした
    scale: 2
  };
  let pdfContent = [];
  for (  var i = 0;  i < element.children.length;  i++  ) {
    // html2canvas実行
    let canvas = await html2canvas(element.children[i], options);

    let dataUrl = canvas.toDataURL();

    if(i === 0){
      pdfContent.push({
        image: dataUrl,
        width: CONTENT_WIDTH,
        height: CONTENT_HEIGHT
      });
    } else {
      // ２ページ目以降は先に前に改ページを挿入する
      pdfContent.push({
        image: dataUrl,
        width: CONTENT_WIDTH,
        height: CONTENT_HEIGHT,
        pageBreak: 'before'
      });
    }
  };
  return pdfContent;
}

/**
 * エンコードされた画像URLを貼り付けたPDFを出力する
 * @param {PdfProps} pdfProps
 */
function createPdf(pdfContent) {
  const documentDefinitions = {
    pageSize: {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    },
    pageOrientation: "PORTRAIT",
    content: pdfContent,
    PAGE_MARGINS
  };

  pdfMake.createPdf(documentDefinitions).download();
}
