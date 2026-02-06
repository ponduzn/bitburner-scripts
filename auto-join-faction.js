/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  //For INT farming, uncomment below.
  //ns.ui.openTail();
  

  while (true) {
    const currentFactionInv = ns.singularity.checkFactionInvitations();
    for (const joinFac of currentFactionInv) {
      const joinReq = ns.singularity.getFactionEnemies(joinFac);
      if (joinReq.length === 0) {
        ns.singularity.joinFaction(joinFac);
      } 
    }
    await ns.sleep(2000);

    //For INT farming, uncomment below.
    //ns.singularity.softReset(ns.getScriptName());
  }
}
