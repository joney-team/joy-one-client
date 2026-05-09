const DOKPLOY_TOKEN = String(process.env.DOKPLOY_TOKEN).trim();
const DOKPLOY_URL = String(process.env.DOKPLOY_URL).trim();
const DOKPLOY_IMAGE = String(process.env.DOKPLOY_IMAGE).trim();
const DOKPLOY_APPLICATION_IDS = String(process.env.DOKPLOY_APPLICATION_IDS).trim().split(',').map(id => id.trim());

const releaseDokploy = async () => {
  for (const applicationId of DOKPLOY_APPLICATION_IDS) {
    const saveDockerProviderResponse = await fetch(`${DOKPLOY_URL}/api/application.saveDockerProvider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': DOKPLOY_TOKEN,
      },
      body: JSON.stringify({
        dockerImage: DOKPLOY_IMAGE,
        applicationId: applicationId,
        username: "",
        password: "",
        registryUrl: ""
      })
    });

    if (!saveDockerProviderResponse.ok) {
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
        applicationId: applicationId
      })
    });

    if (!deployResponse.ok) {
      console.error('Deploy Failed', deployResponse.statusText);
      process.exit(1);
    }

    console.info(`Deployed ${applicationId} > ${DOKPLOY_IMAGE} successfully`);
  }
};

releaseDokploy();