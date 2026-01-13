/** @param {NS} ns */
export async function main(ns) {
 

    const targets = [
        "w0r1d_d43m0n",
        "run4theh111z",
        "powerhouse-fitness",
        "CSEC",
        "I.I.I.I"
    ];

    // Find a path from start to target
    function findPath(start, target) {
        const visited = new Set();

        // Stack holds objects instead of arrays
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

    function printConnect(path, label) {
        if (!path) {
            ns.tprint(label + ": Path not found");
            return;
        }

        const cmd = path.slice(1).map(s => "connect " + s).join("; ") + "; backdoor";

        ns.tprint(label + " cmd:");
        ns.tprint(cmd);
    }

    // Run for each target
    for (const target of targets) {
        const path = findPath("home", target);
        printConnect(path, target);
    }
}
