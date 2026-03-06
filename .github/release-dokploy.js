const DOKPLOY_TOKEN = String(process.env.DOKPLOY_TOKEN).trim();
const DOKPLOY_URL = String(process.env.DOKPLOY_URL).trim();
const DOKPLOY_IMAGE = String(process.env.DOKPLOY_IMAGE).trim();
const DOKPLOY_APPLICATION_ID = String(process.env.DOKPLOY_APPLICATION_ID).trim();

const releaseDokploy = async () => {
  const saveDockerProviderResponse = await fetch(`${DOKPLOY_URL}/api/application.saveDockerProvider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': DOKPLOY_TOKEN,
    },
    body: JSON.stringify({
      dockerImage: DOKPLOY_IMAGE,
      applicationId: DOKPLOY_APPLICATION_ID,
      username: "",
      password: "",
      registryUrl: ""
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

  console.info(`Deployed ${DOKPLOY_APPLICATION_ID} > ${DOKPLOY_IMAGE} successfully`);
};

releaseDokploy();