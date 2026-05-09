import config from "@joy-one/config";

export const configs = {
  backgroundColors: {
    light: "#f3f3f3",
    dark: "#242424",
  },
  maxHistoryOfTasks: 100,
  swatches: [
    "#2e2e2e",
    "#868e96",
    "#fa5252",
    "#e64980",
    "#be4bdb",
    "#7950f2",
    config.PRIMARY_COLOR,
    "#228be6",
    "#15aabf",
    "#12b886",
    "#40c057",
    "#82c91e",
    "#fab005",
    "#fd7e14",
  ],
  metaScope: [
    "pages_show_list",
    "pages_manage_metadata",
    "pages_messaging",
    "pages_read_engagement",
    "public_profile",
  ],
  placeholders: {
    phone: "0909000000",
    email: "example@example.com",
    name: "John Doe",
    address: "123 Main St, Anytown, USA",
  },
  workslotGroupColors: ["primary", "orange", "teal"],
  socialLinks: [
    {
      provider: "facebook.com",
      link: "https://www.facebook.com/profile.php?id=61561814189369",
    },
  ],
};
