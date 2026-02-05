import {
    TextTransforms
} from "./text-transform.js";

const colors = {
	black: "\u001b[30m",
	red: "\u001b[31m",
	green: "\u001b[32m",
	yellow: "\u001b[33m",
	blue: "\u001b[34m",
	magenta: "\u001b[35m",
	cyan: "\u001b[36m",
	white: "\u001b[37m",
	brightBlack: "\u001b[30;1m",
	brightRed: "\u001b[31;1m",
	brightGreen: "\u001b[32;1m",
	brightYellow: "\u001b[33;1m",
	brightBlue: "\u001b[34;1m",
	brightMagenta: "\u001b[35;1m",
	brightCyan: "\u001b[36;1m",
	brightWhite: "\u001b[37;1m",
	reset: "\u001b[0m"
};

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    //ns.ui.openTail();

    function getAllServers() {
        const discovered = ["home"];
        for (let i = 0; i < discovered.length; i++) {
            for (const n of ns.scan(discovered[i])) {
                if (!discovered.includes(n)) discovered.push(n);
            }
        }
        return discovered;
    }

    // Find a path from start to target
    function findPath(start, target) {
        const visited = new Set();

        // Stack holds arrays
        const stack = [{
            server: start,
            path: [start]
        }];

        while (stack.length > 0) {
            const current = stack.pop();

            const server = current.server;
            const path = current.path;

            if (server === target) {
                return path;
            }

            visited.add(server);

            for (const next of ns.scan(server)) {
                if (!visited.has(next)) {
                    stack.push({
                        server: next,
                        path: [...path, next]
                    });
                }
            }
        }

        return null; 
    }

    while (true) {
      const allServers = getAllServers();

      let coolDown = false;
      let lastTarget = null;

      for (const target of allServers) {
        if (target === "home" || target === "darkweb" || target === "w0r1d_d43m0n" || ns.getPurchasedServers().includes(target)) continue;
        const server = ns.getServer(target);

        if (!server.hasAdminRights) {
          continue;
        }
        if (server.backdoorInstalled) {
          continue;
        }
        if (target.startsWith("hacknet-server-")) {
          continue;
        }

        const path = findPath("home", target);
        if (!path) {
          continue;
        }

        for (const hop of path.slice(1)) {
          ns.singularity.connect(hop);
        }

        lastTarget = target;
        coolDown = true;
        display(ns, lastTarget, coolDown);

        await ns.singularity.installBackdoor();
        
        ns.singularity.connect("home");
        await ns.sleep(3000);
      }

      if (!coolDown) {
        display(ns, lastTarget, coolDown);

        await ns.sleep(30000);
      } else {
        await ns.sleep(3000)
      }
    }

    function display(ns, lastTarget, coolDown) {
      ns.clearLog();
      const bordercolor = colors.black;
      const tarcolor = colors.yellow;
      const BOX_WIDTH = 47;
      

      const leftBorder = TextTransforms.apply("| ", [TextTransforms.Color.Black]);
      const rightBorder = TextTransforms.apply(" |", [TextTransforms.Color.Black]);
      const borderLine = TextTransforms.apply("=".repeat(BOX_WIDTH - 3), [TextTransforms.Color.Black]);
      const currTargMsg = TextTransforms.apply("Current target: ".padEnd(17), [TextTransforms.Color.White]);
      const waitinG = TextTransforms.apply("Waiting to try to backdoor more servers.".padEnd(BOX_WIDTH - 7), [TextTransforms.Color.White]);
      const line = currTargMsg + tarcolor + lastTarget;

      if (coolDown) {
        ns.print(bordercolor + borderLine);
        ns.print(leftBorder + line.padEnd(BOX_WIDTH + 14) + rightBorder);
        ns.print(bordercolor + borderLine);

      } else {
        ns.print(bordercolor + borderLine);
        ns.print(leftBorder + waitinG + rightBorder);
        ns.print(bordercolor + borderLine);
      }
    }
}
