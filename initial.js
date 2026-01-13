import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns */
export async function main(ns) {

  ns.disableLog("ALL");
  ns.clearLog();
  ns.ui.openTail();

  const home = "home";

  const started = {
        hackScr: false,
        statsScr: false,
        buyServersScr: false,
        stocksScr: false,
        gangScr: false,
        homeBoostScr: false,
        hacknetScr: false,
        backdoorScr: false,
        allBought: false
  };

  while (true) {
    ns.clearLog();
    
    const myHackLevel = ns.getHackingLevel();
    const myMoney = ns.getServerMoneyAvailable(home);
    const hasGang = ns.gang.inGang();
    const has4s = ns.stock.has4SData();
    const hasTixAcc = ns.stock.hasTIXAPIAccess();
    const hasTixExchAcc = ns.stock.has4SDataTIXAPI();
    const hasWseAcc = ns.stock.hasWSEAccount();
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
    if (!hasFTPC && myMoney > 1_500_000) {
      if (myMoney > 1_500_000) {
        ns.singularity.purchaseProgram("FTPCrack.exe");
      } else if (myHackLevel > 5000 && !ns.singularity.isBusy()) {
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
    if (!servProf) {
      if (myMoney > 500_000) {
          ns.singularity.purchaseProgram("ServerProfiler.exe");
      } else if (myHackLevel > 75 && !ns.singularity.isBusy()) {
          ns.singularity.createProgram("ServerProfiler.exe");
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

    if (hasTor && hasFormApi && hasBruteSSH && hasFTPC && hasRelaySMTP && hasHTTP && hasSQL && servProf && hasDeepV1 && hasDeepV2 && hasAutoL) {
          allBought = true;
        }


    //Control script hacking servers.
    if (!started.hackScr && !ns.isRunning("target-switch-hack-all-s.js", home)) {
      if (ns.exec("target-switch-hack-all-s.js", home) !== 0) started.hackScr = true;
    }

    //Custom stats for overview.
    if (!started.statsScr && !ns.isRunning("customstatsV2.js", home)) {
      if (ns.exec("customstatsV2.js", home) !== 0) started.statsScr = true;
    }

    //Buy servers.
    if (!started.buyServersScr && myMoney > 1_000_000 && !ns.isRunning("buy-servers.js", home)) {
      if (ns.exec("buy-servers.js", home) !== 0) started.buyServersScr = true;
    }

    //Stock trading.
    if (!started.stocksScr && has4s && hasTixAcc && hasWseAcc && hasTixExchAcc && !ns.isRunning("stocktrader-grok.js", home)) {
      if (ns.exec("stocktrader-grok.js", home) !== 0) started.stocksScr = true;
    }

    //Gang automation.
    if (!started.gangScr && hasGang && !ns.isRunning("gang-managerV2.js", home) && hasFormApi) {
      if (ns.exec("gang-managerV2.js", home) !== 0) started.gangScr = true;
    }

    //Hacknet autobuyer.
    if (!started.hacknetScr && myHackLevel > 100 && myMoney > 100_000_000 && !ns.isRunning("hacknet-autobuy-roi-prompt.js", home)) {
      if (ns.exec("hacknet-autobuy-roi-prompt.js", home) !== 0) started.hacknetScr = true;
    }

    //Auto backdoor
    if (!started.backdoorScr && myHackLevel > 100 && !ns.isRunning("backdoor.js", home)) {
      if (ns.exec("backdoor.js", home) !== 0) started.backdoorScr = true;
    }

    //Hack'n rep boost on home.
    if (!started.homeBoostScr && myHackLevel > 100 && ns.getServerMaxRam(home) >= 512 && !ns.isRunning("homehackboost.js", home)) {
      if (ns.exec("homehackboost.js", home) !== 0) started.homeBoostScr = true;
    }


    //Flip flags if running.
    if (ns.isRunning("target-switch-hack-all-s.js", home)) started.hackScr = true;
    if (ns.isRunning("customstatsV2.js", home)) started.statsScr = true;
    if (ns.isRunning("buy-servers.js", home)) started.buyServersScr = true;
    if (ns.isRunning("stocktrader-grok.js", home)) started.stocksScr = true;
    if (ns.isRunning("gang-managerV2.js", home)) started.gangScr = true;
    if (ns.isRunning("homehackboost.js", home)) started.homeBoostScr = true;
    if (ns.isRunning("hacknet-autobuy-roi-prompt.js", home)) started.hacknetScr = true;
    if (ns.isRunning("backdoor.js", home)) started.backdoorScr = true;

    var divLineLong = TextTransforms.apply("===============================", [TextTransforms.Color.Black]);

    //logging:
    ns.print(divLineLong);
    if (started.hackScr === true) ns.print("Hack Control script     = " + TextTransforms.apply(started.hackScr, [TextTransforms.Color.ChartsBlue]));
    if (started.hackScr === false) ns.print("Hack Control script     = " + TextTransforms.apply(started.hackScr, [TextTransforms.Color.DRed]));
    if (started.statsScr === true) ns.print("Extra Overview stats    = " + TextTransforms.apply(started.statsScr, [TextTransforms.Color.ChartsBlue]));
    if (started.statsScr === false) ns.print("Extra Overview stats    = " + TextTransforms.apply(started.statsScr, [TextTransforms.Color.DRed]));
    if (started.buyServersScr === true) ns.print("Server buy script       = " + TextTransforms.apply(started.buyServersScr, [TextTransforms.Color.ChartsBlue]));
    if (started.buyServersScr === false) ns.print("Server buy script       = " + TextTransforms.apply(started.buyServersScr, [TextTransforms.Color.DRed]));
    if (started.stocksScr === true) ns.print("Stock trader script     = " + TextTransforms.apply(started.stocksScr, [TextTransforms.Color.ChartsBlue]));
    if (started.stocksScr === false) ns.print("Stock trader script     = " + TextTransforms.apply(started.stocksScr, [TextTransforms.Color.DRed]));
    if (started.gangScr === true) ns.print("Gang automation         = " + TextTransforms.apply(started.gangScr, [TextTransforms.Color.ChartsBlue]));
    if (started.gangScr === false) ns.print("Gang automation         = " + TextTransforms.apply(started.gangScr, [TextTransforms.Color.DRed]));
    if (started.homeBoostScr === true) ns.print("Hack'n rep boost @ home = " + TextTransforms.apply(started.homeBoostScr, [TextTransforms.Color.ChartsBlue]));
    if (started.homeBoostScr === false) ns.print("Hack'n rep boost @ home = " + TextTransforms.apply(started.homeBoostScr, [TextTransforms.Color.DRed]));
    if (started.hacknetScr === true) ns.print("Hacknet autobuyer       = " + TextTransforms.apply(started.hacknetScr, [TextTransforms.Color.ChartsBlue]));
    if (started.hacknetScr === false) ns.print("Hacknet autobuyer       = " + TextTransforms.apply(started.hacknetScr, [TextTransforms.Color.DRed]));
    if (started.backdoorScr === true) ns.print("Auto backdoor           = " + TextTransforms.apply(started.backdoorScr, [TextTransforms.Color.ChartsBlue]));
    if (started.backdoorScr === false) ns.print("Auto backdoor           = " + TextTransforms.apply(started.backdoorScr, [TextTransforms.Color.DRed]));
    if (started.allBought === true) ns.print("All Programs Bought      = " + TextTransforms.apply(started.allBought, [TextTransforms.Color.ChartsBlue]));
    if (started.allBought === false) ns.print("All Programs Bought     = " + TextTransforms.apply(started.allBought, [TextTransforms.Color.DRed]));

    ns.print(divLineLong);

    //Exit if all flags = true.
    if (Object.values(started).every(v => v)) {
      ns.tprint("All startup scripts launched once.");
      await ns.sleep(5000);
      return;
    }
    await ns.sleep(1000);
  }
}
