export let imageLoaded: string[] = [];
export const loadImage = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    if (imageLoaded.includes(src)) resolve(src);
    imageLoaded.push(src);

    const id = `load_image_${src}`;
    const image = document.createElement("img");
    image.src = src;
    image.id = id;
    image.style.visibility = "hidden";
    image.style.display = "none";
    image.loading = "eager";
    image.onload = function () {
      resolve(src);
      document.body.removeChild(image);
    };
    image.onerror = async function () {
      await loadImage("/images/fallback.png");
      resolve("");
      document.body.removeChild(image);
    };

    document.body.appendChild(image);
  });
};

export const loadSound = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const id = `load_sound_${src}`;
    const sound = document.createElement("audio");
    sound.src = src;
    sound.id = id;
    sound.autoplay = false;
    sound.style.visibility = "hidden";
    sound.style.display = "none";
    sound.onloadeddata = function () {
      resolve(sound);
    };
    sound.onerror = function (error) {
      reject(new Error(`Load sound error with src: ${src}, ${error}`));
    };
    document.body.appendChild(sound);
  });
};

export const loadScript = function (src: string) {
  return new Promise((resolve, reject) => {
    const body = document.getElementsByTagName("body")[0];
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = src;
    body.appendChild(tag);
    tag.onload = function (e) {
      resolve(tag);
    };
    tag.onerror = function (error) {
      reject(error);
    };
  });
};
