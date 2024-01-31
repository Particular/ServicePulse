interface Release {
  tag:  string;
  release:  string;
  published:  string;
}

export async function useServiceProductUrls() {
  const spURL = "https://platformupdate.particular.net/servicepulse.txt";
  const scURL = "https://platformupdate.particular.net/servicecontrol.txt";

  const servicePulse = fetch(spURL).then((response) => {
    return response.json() as unknown as Release[];
  });
  const serviceControl = fetch(scURL).then((response) => {
    return response.json()as unknown as Release[];
  });

  const [sp, sc] = await Promise.all([servicePulse, serviceControl]);
  const latestSP = sp[0];
  const latestSC = sc[0];
  return { latestSP, latestSC };
}
