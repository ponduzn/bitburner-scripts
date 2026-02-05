import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns */
export async function main(ns) {

  ns.disableLog("ALL");
  ns.clearLog();
  //ns.ui.openTail();

  const home = "home";

  const started = { 
                  allBought: false
                                  };

  while (true) {
    ns.clearLog();
    
    const myHackLevel = ns.getHackingLevel();
    const myMoney = ns.getServerMoneyAvailable(home);
    const hasFormApi = ns.fileExists("Formulas.exe", home);
    const hasTor = ns.hasTorRouter();
    const hasBruteSSH = ns.fileExists("BruteSSH.exe", home);
    const hasFTPC = ns.fileExists("FTPCrack.exe", home);
    const hasRelaySMTP = ns.fileExists("relaySMTP.exe", home);
    const hasHTTP = ns.fileExists("HTTPWorm.exe", home);
    const hasSQL = ns.fileExists("SQLInject.exe", home);
    const servProf = ns.fileExists("ServerProfiler.exe", home);
    const hasDeepV1 = ns.fileExists("DeepscanV1.exe", home);
    const hasDeepV2 = ns.fileExists("DeepscanV2.exe", home);
    const hasAutoL = ns.fileExists("AutoLink.exe", home);
    const homeRamCost = ns.singularity.getUpgradeHomeRamCost();
    const homeRamAm = ns.getServerMaxRam(home);
    const homeCores = ns.getServer(home).cpuCores;
    const homeCoresCost = ns.singularity.getUpgradeHomeCoresCost();


    //Buy or create Tor Router and Programs.
    if (!hasTor && myMoney > 200_000) {
      ns.singularity.purchaseTor();
    }
    if (!hasFormApi) {
      if (myMoney > 5_000_000_000) {
          ns.singularity.purchaseProgram("Formulas.exe");
      } else if (myHackLevel > 1000 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("Formulas.exe");
      }
    }
    if (!hasBruteSSH) {
      if (myMoney > 500_000) {
          ns.singularity.purchaseProgram("BruteSSH.exe");
      } else if (myHackLevel > 50 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("BruteSSH.exe");
      }
    }
    if (!hasFTPC) {
      if (myMoney > 1_500_000) {
        ns.singularity.purchaseProgram("FTPCrack.exe");
      } else if (myHackLevel > 100 && !ns.singularity.isBusy()) {
        ns.singularity.createProgram("FTPCrack.exe");
      }
    }
    if (!hasRelaySMTP) {
      if (myMoney > 5_000_000) {
          ns.singularity.purchaseProgram("relaySMTP.exe");
      } else if (myHackLevel > 250 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("relaySMTP.exe");
      }
    }
    if (!hasHTTP) {
      if (myMoney > 5_000_000) {
          ns.singularity.purchaseProgram("HTTPWorm.exe");
      } else if (myHackLevel > 500 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("HTTPWorm.exe");
      }
    }
    if (!hasSQL) {
      if (myMoney > 250_000_000) {
          ns.singularity.purchaseProgram("SQLInject.exe");
      } else if (myHackLevel > 750 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("SQLInject.exe");
      }
    }
    if (!hasDeepV1) {
      if (myMoney > 500_000) {
          ns.singularity.purchaseProgram("DeepscanV1.exe");
      } else if (myHackLevel > 75 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("DeepscanV1.exe");
      }
    }
    if (!hasDeepV2) {
      if (myMoney > 25_000_000) {
          ns.singularity.purchaseProgram("DeepscanV2.exe");
      } else if (myHackLevel > 400 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("DeepscanV2.exe");
      }
    }
    if (!hasAutoL) {
      if (myMoney > 1_000_000) {
          ns.singularity.purchaseProgram("AutoLink.exe");
      } else if (myHackLevel > 25 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("AutoLink.exe");
      }
    }
    if (!servProf) {
      if (myMoney > 500_000) {
          ns.singularity.purchaseProgram("ServerProfiler.exe");
      } else if (myHackLevel > 75 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("ServerProfiler.exe");
      }
    }

    if (hasTor && hasFormApi && hasBruteSSH && hasFTPC && hasRelaySMTP && hasHTTP && hasSQL && servProf && hasDeepV1 && hasDeepV2 && hasAutoL) {
          started.allBought = true;
        }

    //upgrade home ram until 512GB and cpu cores until 4 cores.
    if (homeRamAm < 512 && myMoney >= homeRamCost) {
      ns.singularity.upgradeHomeRam();
    } 
    if (homeCores < 4 && myMoney >= homeCoresCost) {
      ns.singularity.upgradeHomeCores();
    }

    //logging:
    const BOX_WIDTH = 23;
    const leftBorder = TextTransforms.apply("| ", [TextTransforms.Color.Black]);
    const rightBorder = TextTransforms.apply(" |", [TextTransforms.Color.Black]);
    const divLineLong = TextTransforms.apply("==================================", [TextTransforms.Color.Black]);
    ns.print(divLineLong);
    if (started.allBought === true) ns.print(leftBorder + "All Programs Bought".padEnd(22) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.allBought === false) ns.print(leftBorder + "All Programs Bought".padEnd(22) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    ns.print(divLineLong);

    //Exit if all flags = true.
    if (Object.values(started).every(v => v)) {
      const allDone = "✨ All programs are bought. ✨";
      ns.clearLog();
      ns.print(divLineLong);
      ns.print(TextTransforms.apply(allDone, [TextTransforms.Color.Yellow]));
      ns.print(divLineLong);
      await ns.sleep(10000);
      ns.ui.closeTail();
      return;
    }
    await ns.sleep(1000);
  }
}
