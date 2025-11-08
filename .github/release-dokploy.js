const DOKPLOY_TOKEN = process.env.DOKPLOY_TOKEN;
const DOKPLOY_URL = process.env.DOKPLOY_URL;
const DOKPLOY_IMAGE = process.env.DOKPLOY_IMAGE;
const DOKPLOY_APPLICATION_ID = process.env.DOKPLOY_APPLICATION_ID;

const releaseDokploy = async () => {
  await fetch(`${DOKPLOY_URL}/api/application.saveDockerProvider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DOKPLOY_TOKEN}`
    },
    body: JSON.stringify({
      dockerImage: DOKPLOY_IMAGE,
      applicationId: DOKPLOY_APPLICATION_ID
    })
  });

  await fetch(`${DOKPLOY_URL}/api/application.deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DOKPLOY_TOKEN}`
    },
    body: JSON.stringify({
      applicationId: DOKPLOY_APPLICATION_ID
    })
  });
};

releaseDokploy();