const DOKPLOY_TOKEN = process.env.DOKPLOY_TOKEN;
const DOKPLOY_URL = process.env.DOKPLOY_URL;
const DOKPLOY_IMAGE = process.env.DOKPLOY_IMAGE;
const DOKPLOY_APPLICATION_ID = process.env.DOKPLOY_APPLICATION_ID;

const releaseDokploy = async () => {
  const saveDockerProviderResponse = await fetch(`${DOKPLOY_URL}/api/application.saveDockerProvider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DOKPLOY_TOKEN,
    },
    body: JSON.stringify({
      dockerImage: DOKPLOY_IMAGE,
      applicationId: DOKPLOY_APPLICATION_ID
    })
  });

  if (saveDockerProviderResponse.ok) {
    console.log('Save Docker Provider Success');
  } else {
    console.error('Save Docker Provider Failed', saveDockerProviderResponse.statusText);
    process.exit(1);
  }

  const deployResponse = await fetch(`${DOKPLOY_URL}/api/application.deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DOKPLOY_TOKEN,
    },
    body: JSON.stringify({
      applicationId: DOKPLOY_APPLICATION_ID
    })
  });

  if (deployResponse.ok) {
    console.log('Deploy Success');
  } else {
    console.error('Deploy Failed', deployResponse.statusText);
    process.exit(1);
  }
};

releaseDokploy();