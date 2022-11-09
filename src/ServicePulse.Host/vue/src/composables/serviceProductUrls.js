export function useServiceProductUrls() {
    const spURL = 'https://platformupdate.particular.net/servicepulse.txt'
    const scURL = 'https://platformupdate.particular.net/servicecontrol.txt'
    
    const servicePulse = fetch(spURL).then(response=> { return response.json()})
    const serviceControl = fetch(scURL).then(response=> { return response.json()})

    return Promise
    .all([servicePulse, serviceControl])
    .then(([sp, sc]) => {
        var latestSP = sp[0]
        var latestSC = sc[0]
        
        return {latestSP, latestSC}
    });
}