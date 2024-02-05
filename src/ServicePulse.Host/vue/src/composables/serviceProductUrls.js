async function getData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function useServiceProductUrls() {
  const spURL = "https://platformupdate.particular.net/servicepulse.txt";
  const scURL = "https://platformupdate.particular.net/servicecontrol.txt";

  const servicePulse = getData(spURL);
  const serviceControl = getData(scURL);

  const [sp, sc] = await Promise.all([servicePulse, serviceControl]);
  const latestSP = sp[0];
  const latestSC = sc[0];

  return { latestSP, latestSC };
}
