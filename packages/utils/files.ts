export function formatBytes(bytes: number) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  let dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  if (i <= 1) dm = 0;

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function parseQuery(_queryString: string): any {
  const queryString = _queryString.split('?')[1];
  const query: any = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

export const downloadFile = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
  const file = new File([blob], fileName);
  return file;
};

export const isImageURL = (url: string) => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

export const detectImageUrl = (rawURL: string): string => {
  let URL = '';

  if (rawURL.indexOf('google.com') !== -1) {
    const { imgurl } = parseQuery(decodeURIComponent(rawURL));
    if (imgurl && isImageURL(imgurl)) URL = imgurl;
  } else if (isImageURL(rawURL)) {
    URL = rawURL;
  }

  return URL;
}

export const isImageFile = (file: File) => {
  return file.type.match('image/*') !== null;
}

/**
 * Downloads JSON data as a file in the browser
 * @param data - The JSON data to download
 * @param filename - The name of the downloaded file (default: "data.json")
 */
export function downloadJSON(data: any, filename: string = "data.json"): void {
  // Convert the data to a JSON string
  const jsonString: string = JSON.stringify(data, null, 2);
  
  // Create a Blob containing the JSON string
  const blob: Blob = new Blob([jsonString], { type: "application/json" });
  
  // Create a URL for the Blob
  const url: string = URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const link: HTMLAnchorElement = document.createElement("a");
  
  // Set the download attributes
  link.href = url;
  link.download = filename;
  
  // Append the link to the body (required in Firefox)
  document.body.appendChild(link);
  
  // Simulate a click on the link
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}