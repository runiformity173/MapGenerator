const divisor = 0x10000000;
const mix = function(a, b, t) {
    return a * (1.0-t) + b * t;
};
const mixp = function(out, p, q, t) {
    out.length = 2;
    for (let i = 0; i < 2; i++) {
        out[i] = mix(p[i], q[i], t);
    }
    return out;
};
const recursiveSubdivision = function(length, amplitude, randInt) {
    function recur(a, b, p, q) {
        let dx = a[0] - b[0], dy = a[1] - b[1];
        if (dx*dx + dy*dy < length*length) { return [b]; }

        let ap = mixp([], a, p, 0.5),
            bp = mixp([], b, p, 0.5),
            aq = mixp([], a, q, 0.5),
            bq = mixp([], b, q, 0.5);

        let division = 0.5 * (1 - amplitude) + randInt(divisor)/divisor * amplitude;
        let center = mixp([], p, q, division);

        let results1 = recur(a, center, ap, aq),
            results2 = recur(center, b, bp, bq);

        return results1.concat(results2);
    };
    return recur;
}

const getBetterPolygon = function(s_lines, [amplitude, length], randInt) {
    
    const subdivide = recursiveSubdivision(length, amplitude, randInt);
    s_lines.length = edges.length;
    s_lines.fill(0);
    for (let s = 0; s < edges.length; s++) {
        let t0 = edges[s].lSite,
            t1 = edges[s].rSite,
            r0 = edges[s].va,
            r1 = edges[s].vb;
        if (r0.index < r1.index) {
            if (t0 == null || t1 == null) {
                s_lines[s] = [[(t1||t0).x,(t1||t0).y]];
            } else {
                s_lines[s] = subdivide(
                    [t0.x,t0.y],
                    [t1.x,t1.y],
                    [r0.x,r0.y],
                    [r1.x,r1.y]
                );
            }
            // construct line going the other way; since the line is a
            // half-open interval with [p1, p2, p3, ..., pn] but not
            // p0, we want to reverse all but the last element, and
            // then append p0
            // let opposite = s_lines[s].slice(0, -1);
            // opposite.reverse();
            // opposite.push([t0.x,t0.y]);
            // s_lines[mesh.s_opposite_s(s)] = opposite;
        }
    }
    return s_lines;
};
