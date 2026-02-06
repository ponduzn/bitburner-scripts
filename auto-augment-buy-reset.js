import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.ui.openTail();
  ns.ui.resizeTail(230, 120);
  ns.ui.setTailTitle("Auto Augment Manager");
  

  while (true) {
    const currentGangFac = ns.gang.getGangInformation().faction;
    const currentAugs = ns.singularity.getOwnedAugmentations(true); // bought or queued
    const totalAugsOwned = ns.singularity.getOwnedAugmentations(false); // all ever owned (installed + bought)
    const augListAvail = ns.singularity.getAugmentationsFromFaction(currentGangFac);
    const myRep = ns.singularity.getFactionRep(currentGangFac);
    const totalBoughtAug = currentAugs.length - totalAugsOwned.length;
    const nfgs = "NeuroFlux Governor";
    const joinedPlayerFactions = ns.getPlayer().factions;
    const fundsFraction = 0.50;
    const myMoney = ns.getServerMoneyAvailable("home");
    const timeSinceLastAug = ns.getTimeSinceLastAug();
    

    //Buy any available augments from joined factions.
    for (let faction of joinedPlayerFactions) {
      let factionAugs = ns.singularity.getAugmentationsFromFaction(faction);
      let factionRep = ns.singularity.getFactionRep(faction);

      for (const aug of factionAugs) {
        if (aug === nfgs) continue;
        if (totalAugsOwned.includes(aug)) continue;

        let prereqs = ns.singularity.getAugmentationPrereq(aug);
        if (!prereqs.every(p => totalAugsOwned.includes(p))) continue;

        if (factionRep < ns.singularity.getAugmentationRepReq(aug)) continue;
          ns.singularity.purchaseAugmentation(faction, aug);
      }
    }
    
    //Check what augments are available in gang, and if i can afford, then buy.
    for (let check of augListAvail.reverse()) {
      if (currentAugs.includes(check)) continue;

      let prereqs = ns.singularity.getAugmentationPrereq(check);
      let prereqsMet = true;
      for (let p of prereqs) {
        if (!currentAugs.includes(p) && !totalAugsOwned.includes(p)) {
          prereqsMet = false;
          break;
        }
      }
      if (prereqsMet) {
        if (myRep >= ns.singularity.getAugmentationRepReq(check) && ns.singularity.getAugmentationPrice(check) < fundsFraction * myMoney) {
          ns.singularity.purchaseAugmentation(currentGangFac, check);
        }
      }
    }

    //Buy NFG from factions with enough rep.
    const factionWithNfg = ns.singularity.getAugmentationFactions(nfgs);
    const ownedAugsInfo = ns.getResetInfo().ownedAugs;
    const nfgCount = ownedAugsInfo.get(nfgs) ?? 0;
    for (let faction of factionWithNfg) {
      if (nfgCount <= 50) {
        if (ns.singularity.getFactionRep(faction) > ns.singularity.getAugmentationRepReq(nfgs)) {
          ns.singularity.purchaseAugmentation(faction, nfgs);
        }
      }
    }

    //install and launch startup script after 10 or more bought augments, or 2h since last aug.
    if (totalBoughtAug >= 10 || (timeSinceLastAug > 7200000 && totalBoughtAug > 0)) {
      ns.print("Augs ready, installing...");
      ns.print(totalBoughtAug);
      await ns.sleep(5000);
      ns.singularity.installAugmentations("initial.js"); 
    }

    //Logging
    ns.clearLog();
    const BOX_WIDTH = 19;
    const leftBorder = TextTransforms.apply("| ", [TextTransforms.Color.Black]);
    const rightBorder = TextTransforms.apply(" |", [TextTransforms.Color.Black]);
    const divLineLong = TextTransforms.apply("=".repeat(BOX_WIDTH + 4), [TextTransforms.Color.Black]);
    ns.print(divLineLong);
    ns.print(leftBorder + `Augments bought: ${totalBoughtAug}`.padEnd(BOX_WIDTH) + rightBorder);
    ns.print(leftBorder + `Total NFGS: ${nfgCount}`.padEnd(BOX_WIDTH) + rightBorder);
    ns.print(divLineLong);
    await ns.sleep(1000);
  }
}
