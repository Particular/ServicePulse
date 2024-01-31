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
  var latestSP = sp[0];
  var latestSC = sc[0];

  return { latestSP, latestSC };
}
