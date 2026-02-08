import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    ns.ui.resizeTail(845, 250);
    ns.ui.setTailTitle("Sleeves Manager");
    ns.ui.moveTail(+1520, +1025);

    const BOX_WIDTH = 87;
    const leftBorder = TextTransforms.apply("| ", [TextTransforms.Color.Black]);
    const rightBorder = TextTransforms.apply(" |", [TextTransforms.Color.Black]);
    const borderCenter = TextTransforms.apply("|", [TextTransforms.Color.Black]);
    const divLineLong = TextTransforms.apply("─", [TextTransforms.Color.Black]);

    while (true) {
        ns.clearLog();
        let sleeveCrime = "Homicide";
        if (ns.args.length > 0) sleeveCrime = ns.args[0];

        const statusLines = [];
        const statsLines = [];
        const MIRROR_SLEEVE = 0;
        

        for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
            let sleeves = ns.sleeve.getSleeve(i);
            let fundsFraction = 0.04;
            const hasGang = ns.gang.inGang();
            let combatStatThresh = 60;
            let defensiveStatThresh = 35;
            let hackStatThresh = 10;
            const homicideReady = 
              sleeves.skills.strength >= combatStatThresh &&
              sleeves.skills.dexterity >= combatStatThresh &&
              sleeves.skills.agility >= defensiveStatThresh &&
              sleeves.skills.defense >= defensiveStatThresh;
            let shockThresh = 80;
            let syncThresh = 5;
            let playerWork = ns.singularity.getCurrentWork();
            const karmaLevel = ns.heart.break();
            const karmaThresh = -54000;
            const task = ns.sleeve.getTask(i);
            const excludedAugs = {
                "CashRoot Starter Kit": true,
                "Neuroreceptor Management Implant": true
            };

            //If shock is 0, then start buying augs.
            if (sleeves.shock === 0) {
                for (const aug of ns.sleeve.getSleevePurchasableAugs(i)) {
                    if (aug.name in excludedAugs) continue;
                    if (aug.cost < fundsFraction * ns.getPlayer().money) {
                        if (ns.sleeve.purchaseSleeveAug(i, aug.name)) {
                            ns.print(`Sleeve ${i} purchased ${aug.name}`);
                        }
                    }
                }
            }

            //If gang unlocked, then increase shock and sync threshold.
            if (hasGang && sleeves.shock <= shockThresh) shockThresh = 0;
            if (hasGang && sleeves.sync >= syncThresh) syncThresh = 50;
            if (homicideReady && karmaLevel < karmaThresh) {
                combatStatThresh = 200;
                hackStatThresh = 100;
                defensiveStatThresh = 100;
            }

            //Sleeve 0 mirroring player work.
            if (i === MIRROR_SLEEVE) {
                if (playerWork?.type === "FACTION" || playerWork?.type === "COMPANY" || playerWork?.type === "CLASS") {
                    const task = ns.sleeve.getTask(i);

                    if (playerWork.type === "FACTION") {
                      if (task?.factionName !== playerWork.factionName) {
                        ns.sleeve.setToFactionWork(i, playerWork.factionName, playerWork.factionWorkType);
                      }
                    } 
                    else if (playerWork.type === "COMPANY") {
                      if (task?.companyName !== playerWork.companyName) {
                        ns.sleeve.setToCompanyWork(i, playerWork.companyName);
                      }
                    }

                    //LOGGING for sleeve 0 if mirroring player.
                    const taskUpdated = ns.sleeve.getTask(i);
                    if (taskUpdated.type == "CRIME") statusLines.push(`Sleeve ${i}: doing task ${taskUpdated.crimeType}.`.padStart(55).padEnd(10));
                    else if (taskUpdated?.type == "CLASS") statusLines.push(`Sleeve ${i}: leveling ${taskUpdated.classType}.`.padStart(55).padEnd(10));
                    else if (taskUpdated?.type == "SYNCHRO") statusLines.push(`Sleeve ${i}: increasing ${taskUpdated.type}.`.padStart(55).padEnd(10));
                    else if (taskUpdated?.type == "RECOVERY") statusLines.push(`Sleeve ${i}: ${taskUpdated.type} for shock.`.padStart(55).padEnd(10));
                    else if (taskUpdated?.type == "FACTION") statusLines.push(`Sleeve ${i}: performing ${taskUpdated.factionWorkType}.`.padStart(55).padEnd(10));
                    else if (taskUpdated?.type == "COMPANY") statusLines.push(`Sleeve ${i}: working for ${taskUpdated.companyName}.`.padStart(55).padEnd(10));

                    let statsLine = 
                        borderCenter + ` S: ${i}`.padEnd(9) + 
                        borderCenter + `💪: ${ns.formatNumber(sleeves.skills.strength, 0)}`.padEnd(10) +
                        borderCenter + `🎯: ${ns.formatNumber(sleeves.skills.dexterity, 0)}`.padEnd(10) +
                        borderCenter + `🏃: ${ns.formatNumber(sleeves.skills.agility, 0)}`.padEnd(10) +
                        borderCenter + `🛡: ${ns.formatNumber(sleeves.skills.defense, 0)}`.padEnd(10) +
                        borderCenter + `🖥️: ${ns.formatNumber(sleeves.skills.hacking, 0)}`.padEnd(10) +
                        borderCenter + `🔄: ${ns.formatNumber(sleeves.sync, 0)}%`.padEnd(10) +
                        borderCenter + `🗲: ${ns.formatNumber(sleeves.shock, 0)}`.padEnd(10);
                    statsLines.push(statsLine);

                    continue;
                }
            }

            if (sleeves.shock > shockThresh) {
                ns.sleeve.setToShockRecovery(i);
            } else if (sleeves.sync < syncThresh) {
                ns.sleeve.setToSynchronize(i);
            } else if (sleeveCrime !== "Homicide") {
                if (task?.type !== "CRIME" || task.crimeType !== "Mug") {
                    ns.sleeve.setToCommitCrime(i, "Mug");
                }
            } else if (sleeves.shock <= shockThresh && sleeves.sync >= syncThresh) {
                if (sleeves.skills.strength < combatStatThresh) {
                    ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "str");
                } else if (sleeves.skills.dexterity < combatStatThresh) {
                    ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "dex");
                } else if (sleeves.skills.agility < combatStatThresh) {
                    ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "agi");
                } else if (sleeves.skills.defense < combatStatThresh) {
                    ns.sleeve.setToGymWorkout(i, "Powerhouse Gym", "def");
                } else if (sleeves.skills.hacking < hackStatThresh) {
                    ns.sleeve.setToUniversityCourse(i, "Rothman University", "Algorithms");
                } else {
                    if (homicideReady) {
                        if (!hasGang) {
                            if (task?.type !== "CRIME" || task.crimeType !== sleeveCrime) {
                                ns.sleeve.setToCommitCrime(i, sleeveCrime);
                            }
                        } else {
                            if (hasGang) {
                                ns.sleeve.setToUniversityCourse(i, "Rothman University", "Algorithms");
                            }
                        }
                    }
                }
            }
        

            //LOGGING
            const taskUpdated = ns.sleeve.getTask(i);
            if (taskUpdated?.type == "CRIME") statusLines.push(`Sleeve ${i}: doing task ${taskUpdated.crimeType}.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == "CLASS") statusLines.push(`Sleeve ${i}: leveling ${taskUpdated.classType}.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == "SYNCHRO") statusLines.push(`Sleeve ${i}: increasing ${taskUpdated.type}.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == "RECOVERY") statusLines.push(`Sleeve ${i}: ${taskUpdated.type} for shock.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == "FACTION") statusLines.push(`Sleeve ${i}: performing ${taskUpdated.factionWorkType}.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == "COMPANY") statusLines.push(`Sleeve ${i}: performing ${taskUpdated.companyName}.`.padStart(55).padEnd(10));
            else if (taskUpdated?.type == undefined) statusLines.push(`Sleeve ${i}: idling.`.padStart(55).padEnd(10));

            let statsLine = 
                borderCenter + ` S: ${i}`.padEnd(9) + 
                borderCenter + `💪: ${ns.formatNumber(sleeves.skills.strength, 0)}`.padEnd(10) +
                borderCenter + `🎯: ${ns.formatNumber(sleeves.skills.dexterity, 0)}`.padEnd(10) +
                borderCenter + `🏃: ${ns.formatNumber(sleeves.skills.agility, 0)}`.padEnd(10) +
                borderCenter + `🛡: ${ns.formatNumber(sleeves.skills.defense, 0)}`.padEnd(10) +
                borderCenter + `🖥️: ${ns.formatNumber(sleeves.skills.hacking, 0)}`.padEnd(10) +
                borderCenter + `🔄: ${ns.formatNumber(sleeves.sync, 0)}%`.padEnd(10) +
                borderCenter + `🗲: ${ns.formatNumber(sleeves.shock, 0)}`.padEnd(10);
            statsLines.push(statsLine);
        }

        //Status box
        ns.print(divLineLong.repeat(BOX_WIDTH));
        for (const line of statusLines) {
            ns.print(leftBorder + line.padStart(55).padEnd(BOX_WIDTH - 4) + rightBorder);
        }

        //Stats box
        ns.print(divLineLong.repeat(BOX_WIDTH));
        for (const line of statsLines) {
            ns.print(line.padEnd(BOX_WIDTH + 121) + borderCenter);
        }
        ns.print(divLineLong.repeat(BOX_WIDTH));

        await ns.sleep(500);
    }
}
