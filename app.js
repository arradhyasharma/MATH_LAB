
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // MATHLAB V1 — APPLICATION CONTROLLER
    // Learn, Labs, Experiments, Practice, Challenges,
    // Formula Library and Progress
    // =====================================================

    const mainContent = document.getElementById("main-content");

    if (!mainContent) {
        console.error("MathLab: #main-content was not found.");
        return;
    }

    const STORAGE_KEY = "mathlab_dashboard_v2";
    const LEGACY_STORAGE_KEY = "mathlab_dashboard_v1";

    const curriculum = window.MATHLAB_CLASS9_CURRICULUM;

    const state = {
        activeTool: "labs",
        activePath: "coordinates",
        challenge: null,
        challengeTimer: null,
        practiceQuestion: null,
        practiceAnswered: false,
        practiceHintShown: false,
        coinResult: null
    };


    // =====================================================
    // HTML SAFETY
    // =====================================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }


    // =====================================================
    // DATE HELPERS
    // =====================================================

    function getTodayKey() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    function formatDate(dateString) {
        if (!dateString) return "Unknown date";

        const parts = dateString.split("-");

        if (parts.length !== 3) return dateString;

        const date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    // =====================================================
    // LOCAL STORAGE AND PROGRESS
    // =====================================================

    function createEmptyStats() {
        return {
            topicsOpened: [],
            lastTopic: "",
            challengesCompleted: 0,
            completedChallengeDates: [],
            activity: [],
            challengeHistory: [],
            practiceAnswered: 0,
            practiceCorrect: 0,
            labExperiments: 0
        };
    }

    function readStats() {
        try {
            let saved = localStorage.getItem(STORAGE_KEY);

            // Import progress from the previous app version.
            if (!saved) {
                saved = localStorage.getItem(LEGACY_STORAGE_KEY);
            }

            if (!saved) {
                return createEmptyStats();
            }

            const data = JSON.parse(saved);

            if (!data || typeof data !== "object") {
                return createEmptyStats();
            }

            return {
                topicsOpened: Array.isArray(data.topicsOpened)
                    ? data.topicsOpened
                    : [],

                lastTopic: typeof data.lastTopic === "string"
                    ? data.lastTopic
                    : "",

                challengesCompleted:
                    Number(data.challengesCompleted) || 0,

                completedChallengeDates:
                    Array.isArray(data.completedChallengeDates)
                        ? data.completedChallengeDates
                        : [],

                activity: Array.isArray(data.activity)
                    ? data.activity.slice(0, 20)
                    : [],

                challengeHistory:
                    Array.isArray(data.challengeHistory)
                        ? data.challengeHistory.slice(0, 20)
                        : [],

                practiceAnswered:
                    Number(data.practiceAnswered) || 0,

                practiceCorrect:
                    Number(data.practiceCorrect) || 0,

                labExperiments:
                    Number(data.labExperiments) || 0
            };

        } catch (error) {
            console.warn("MathLab could not read saved progress.", error);
            return createEmptyStats();
        }
    }

    const stats = readStats();

    function saveStats() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(stats)
            );

            return true;

        } catch (error) {
            console.warn("MathLab could not save progress.", error);
            return false;
        }
    }

    function recordActivity(title, description) {
        stats.activity.unshift({
            title: title,
            description: description,
            date: getTodayKey()
        });

        stats.activity = stats.activity.slice(0, 20);

        saveStats();
    }


    // =====================================================
    // CONNECT WITH THE EXISTING LEARN MODULE
    // =====================================================

    window.MathLabAppContext = {
        stats: stats,
        recordActivity: recordActivity
    };


    // =====================================================
    // QUESTION BANK
    // Starter practice questions, not an official
    // chapter-wise syllabus question bank.
    // =====================================================

    const questionBank = [

        {
            chapterId: "orienting-yourself-coordinates",
            question: "In which quadrant does the point (4, -3) lie?",
            answer: "IV",
            accepted: ["fourth", "quadrant IV"],
            hint: "The x-coordinate is positive and the y-coordinate is negative.",
            explanation: "Positive x and negative y coordinates place a point in Quadrant IV."
        },

        {
            chapterId: "introduction-to-linear-polynomials",
            question: "Find the value of 3x + 2 when x = 4.",
            answer: "14",
            hint: "Substitute 4 for x.",
            explanation: "3 × 4 + 2 = 12 + 2 = 14."
        },

        {
            chapterId: "the-world-of-numbers",
            question: "What is the square root of 81?",
            answer: "9",
            hint: "Which number multiplied by itself gives 81?",
            explanation: "9 × 9 = 81, so the square root is 9."
        },

        {
            chapterId: "exploring-algebraic-identities",
            question: "Complete the identity: (a + b)² = ?",
            answer: "a² + 2ab + b²",
            accepted: [
                "a^2+2ab+b^2",
                "a²+2ab+b²",
                "a2+2ab+b2"
            ],
            hint: "Multiply (a + b) by (a + b).",
            explanation: "(a + b)² = a² + 2ab + b²."
        },

        {
            chapterId: "circles",
            question: "A circle has a radius of 6 cm. What is its diameter in cm?",
            answer: "12",
            hint: "Diameter is twice the radius.",
            explanation: "Diameter = 2 × radius = 2 × 6 = 12 cm."
        },

        {
            chapterId: "measuring-space-perimeter-and-area",
            question: "A square has a side length of 7 cm. Find its perimeter in cm.",
            answer: "28",
            hint: "A square has four equal sides.",
            explanation: "Perimeter = 4 × side = 4 × 7 = 28 cm."
        },

        {
            chapterId: "introduction-to-probability",
            question: "A fair coin is tossed once. What is the probability of getting heads?",
            answer: "1/2",
            accepted: ["0.5", "50%", "1 / 2"],
            hint: "There are two equally likely outcomes.",
            explanation: "There is one favourable outcome out of two equally likely outcomes."
        },

        {
            chapterId: "sequences-and-progressions",
            question: "Find the next number: 4, 7, 10, 13, __.",
            answer: "16",
            hint: "Look at the difference between consecutive terms.",
            explanation: "Each term increases by 3, so the next term is 16."
        },

        {
            chapterId: "propositions-and-converses",
            question: "True or false: If a number is divisible by 4, it is even.",
            answer: "true",
            accepted: ["yes"],
            hint: "Every multiple of 4 is also a multiple of 2.",
            explanation: "The statement is true because every integer divisible by 4 is divisible by 2."
        },

        {
            chapterId: "understanding-data",
            question: "Find the mean of 5, 7 and 9.",
            answer: "7",
            hint: "Add the values and divide by the number of values.",
            explanation: "(5 + 7 + 9) ÷ 3 = 21 ÷ 3 = 7."
        },

        {
            chapterId: "quadrilaterals",
            question: "What is the sum of the interior angles of a quadrilateral?",
            answer: "360",
            accepted: ["360°", "360 degrees"],
            hint: "A quadrilateral can be divided into two triangles.",
            explanation: "The interior angle sum is 360°."
        },

        {
            chapterId: "two-variables-one-line",
            question: "If x + y = 10 and x = 4, find y.",
            answer: "6",
            hint: "Subtract 4 from both sides.",
            explanation: "4 + y = 10, so y = 6."
        },

        {
            chapterId: "surface-area-and-volume",
            question: "Find the volume of a cube with side length 3 cm.",
            answer: "27",
            hint: "Volume of a cube = side × side × side.",
            explanation: "3 × 3 × 3 = 27 cubic centimetres."
        }

    ];


    // =====================================================
    // ANSWER CHECKING
    // =====================================================

    function normalizeAnswer(value) {
        return String(value)
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/²/g, "^2")
            .replace(/³/g, "^3")
            .replace(/°/g, "degrees")
            .replace(/,/g, "");
    }

    function isCorrectAnswer(userAnswer, question) {
        const user = normalizeAnswer(userAnswer);

        const accepted = [
            question.answer
        ].concat(question.accepted || []);

        return accepted.some(function (answer) {
            return normalizeAnswer(answer) === user;
        });
    }

    function getQuestionChapterName(question) {
        if (!curriculum || !Array.isArray(curriculum.chapters)) {
            return "Mathematics";
        }

        const chapter = curriculum.chapters.find(function (item) {
            return item.id === question.chapterId;
        });

        return chapter ? chapter.name : "Mathematics";
    }


    // =====================================================
    // WORKSPACE NAVIGATION
    // =====================================================

    const tools = [
        { id: "labs", label: "Math Labs" },
        { id: "practice", label: "Practice" },
        { id: "challenge", label: "Challenge Mode" },
        { id: "formulas", label: "Formula Library" }
    ];

    function createWorkspaceNavigation() {
        let navigation = document.getElementById("mathlab-workspace-nav");

        if (navigation) return navigation;

        navigation = document.createElement("nav");

        navigation.id = "mathlab-workspace-nav";
        navigation.className = "mathlab-workspace-nav";
        navigation.setAttribute("aria-label", "Learn workspace tools");

        navigation.innerHTML = tools.map(function (tool) {
            return `
                <button
                    type="button"
                    class="workspace-tool-button"
                    data-tool="${tool.id}"
                    aria-pressed="false">
                    ${escapeHTML(tool.label)}
                </button>
            `;
        }).join("");

        const appLayout = mainContent.closest(".app-layout");
        if (appLayout) {
            appLayout.insertAdjacentElement("beforebegin", navigation);
        } else {
            mainContent.insertAdjacentElement("beforebegin", navigation);
        }
        
        return navigation;
    }

    const workspaceNavigation = createWorkspaceNavigation();

    function updateToolNavigation() {
        workspaceNavigation
            .querySelectorAll("[data-tool]")
            .forEach(function (button) {

                const active = button.dataset.tool === state.activeTool;

                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
    }


    // =====================================================
    // SHARED PAGE LAYOUT
    // =====================================================

    function pageHeader(kicker, title, description) {
        return `
            <section class="workspace-page-header">
                <p class="eyebrow">${escapeHTML(kicker)}</p>
                <h1>${escapeHTML(title)}</h1>
                <p class="welcome-description">
                    ${escapeHTML(description)}
                </p>
            </section>
        `;
    }

    function renderError(message) {
        mainContent.innerHTML = `
            <section class="workspace-empty-state" role="alert">
                <h2>Something went wrong</h2>
                <p>${escapeHTML(message)}</p>
                <button type="button" data-action="return-learn">
                    Return to Learn
                </button>
            </section>
        `;
    }


    // =====================================================
    // LEARN
    // Existing learn.js remains responsible for chapters.
    // =====================================================

    function renderLearn() {
        if (!window.MathLabLearn ||
            typeof window.MathLabLearn.render !== "function") {

            renderError(
                "The Learn module could not load. Check the script paths and script order in index.html."
            );

            return;
        }

        window.MathLabLearn.render(mainContent, stats);
    }


    // =====================================================
    // INTERACTIVE MATH LAB — COORDINATE EXPLORER
    // =====================================================

    function getCoordinateDescription(x, y) {
        if (x === 0 && y === 0) return "The origin";

        if (x === 0) return "On the y-axis";

        if (y === 0) return "On the x-axis";

        if (x > 0 && y > 0) return "Quadrant I";

        if (x < 0 && y > 0) return "Quadrant II";

        if (x < 0 && y < 0) return "Quadrant III";

        return "Quadrant IV";
    }

    function createCoordinateGrid(x, y) {
        let lines = "";

        for (let i = -5; i <= 5; i++) {
            const position = 150 + i * 24;

            lines += `
                <line x1="${position}" y1="30"
                    x2="${position}" y2="270"
                    stroke="#d5dce5" stroke-width="1"/>

                <line x1="30" y1="${position}"
                    x2="270" y2="${position}"
                    stroke="#d5dce5" stroke-width="1"/>
            `;
        }

        const pointX = 150 + x * 24;
        const pointY = 150 - y * 24;

        return `
            <svg viewBox="0 0 300 300"
                role="img"
                aria-label="Coordinate grid showing point ${x}, ${y}"
                class="coordinate-grid">

                ${lines}

                <line x1="150" y1="20" x2="150" y2="280"
                    stroke="#334155" stroke-width="2"/>

                <line x1="20" y1="150" x2="280" y2="150"
                    stroke="#334155" stroke-width="2"/>

                <path d="M 150 15 L 145 25 L 155 25 Z"
                    fill="#334155"/>

                <path d="M 285 150 L 275 145 L 275 155 Z"
                    fill="#334155"/>

                <circle cx="${pointX}" cy="${pointY}" r="7"
                    fill="#0891b2" stroke="#ffffff" stroke-width="2"/>

                <text x="${pointX + 10}" y="${pointY - 10}"
                    font-size="11" fill="#0f172a">
                    (${x}, ${y})
                </text>

                <text x="285" y="140" font-size="11">x</text>
                <text x="160" y="17" font-size="11">y</text>
            </svg>
        `;
    }

    const labPaths = [
        {id:"coordinates",name:"Coordinate Geometry",chapters:"01 · Orienting Yourself: The Use of Coordinates",desc:"Understand the Cartesian plane, plot points and explore straight-line graphs."},
        {id:"algebra",name:"Algebra",chapters:"02 · Linear Polynomials  |  04 · Algebraic Identities  |  13 · Two Variables, One Line",desc:"Build algebraic expressions, solve simple equations and connect equations to graphs."},
        {id:"geometry",name:"Geometry & Mensuration",chapters:"05 · Circles  |  06 · Perimeter and Area  |  12 · Quadrilaterals  |  14 · Surface Area and Volume",desc:"Explore shapes, properties, perimeter, area and three-dimensional measurement."},
        {id:"probability",name:"Probability & Statistics",chapters:"07 · Probability  |  10 · Understanding Data",desc:"Compare theoretical and experimental probability, then describe data using averages."},
        {id:"foundations",name:"Number, Patterns & Logic",chapters:"03 · The World of Numbers  |  08 · Sequences and Progressions  |  09 · Propositions and Converses  |  11 · Algorithms",desc:"Connect number systems, patterns, mathematical statements and step-by-step algorithms."}
    ];

    function renderLabs(pathId) {
        if (pathId) state.activePath = pathId;
        const path = labPaths.find(p => p.id === state.activePath) || labPaths[0];
        const tabs = labPaths.map(p => `<button class="lab-path-tab ${p.id===path.id?'active':''}" data-path="${p.id}" type="button"><strong>${p.name}</strong><small>${p.chapters}</small></button>`).join('');
        let lesson = '';
        if (path.id === 'coordinates') lesson = `
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">01 · THE IDEA</span><h3>The Cartesian plane</h3><p>A graph is a visual way to show relationships. The Cartesian plane has a horizontal <b>x-axis</b>, a vertical <b>y-axis</b> and an <b>origin</b> (0, 0). The axes divide the plane into four quadrants.</p><p>A point is written as <b>(x, y)</b>: move along x first, then y. Positive x is right; negative x is left. Positive y is up; negative y is down.</p></article><article class="lab-lesson"><span class="lesson-number">02 · WORKED EXAMPLE</span><h3>Locate (3, −2)</h3><p>Move 3 units right, then 2 units down. Since x is positive and y is negative, the point lies in <b>Quadrant IV</b>.</p><p class="worked-answer">(3, −2) → Quadrant IV</p></article></div>
          <section class="lab-experiment"><div class="experiment-heading"><span class="lesson-number">INTERACTIVE EXPERIMENT 01</span><h3>Plot a point</h3><p>Click anywhere inside the graph. MathLab will identify the coordinates and quadrant.</p></div><div class="coordinate-lab-layout"><div id="click-grid-wrap"><svg id="click-grid" class="coordinate-grid clickable-grid" viewBox="0 0 300 300" role="img" aria-label="Interactive coordinate grid">${Array.from({length:11},(_,i)=>`<line x1="${30+i*24}" y1="30" x2="${30+i*24}" y2="270" stroke="#dce2d5"/><line x1="30" y1="${30+i*24}" x2="270" y2="${30+i*24}" stroke="#dce2d5"/>`).join('')}<line x1="150" y1="18" x2="150" y2="282" stroke="#20251d" stroke-width="2"/><line x1="18" y1="150" x2="282" y2="150" stroke="#20251d" stroke-width="2"/><text x="282" y="140">x</text><text x="160" y="18">y</text><circle id="plotted-point" cx="222" cy="102" r="7" fill="#8ebc28" stroke="#20251d" stroke-width="1.5"/><text id="plotted-label" x="232" y="92" font-size="11">(3, 2)</text></svg></div><div class="experiment-result"><span class="result-label">YOUR POINT</span><strong id="point-result">(3, 2)</strong><p id="point-quadrant">Quadrant I</p><small>Grid range: −5 to +5</small></div></div></section>
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">03 · DISTANCE & MIDPOINT</span><h3>Between two points</h3><p>For A(x₁, y₁) and B(x₂, y₂), the distance is the length of the segment joining them. The midpoint is exactly halfway between the two points.</p><p class="formula-strip">Distance = √[(x₂ − x₁)² + (y₂ − y₁)²]</p><p class="formula-strip">Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)</p><p class="scope-note">These are useful coordinate-geometry extensions; check your teacher's prescribed scope before treating them as required syllabus content.</p></article><article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 02</span><h3>Distance & midpoint calculator</h3><div class="mini-input-grid">${['x1','y1','x2','y2'].map((v,i)=>`<label>${v.toUpperCase()}<input type="number" id="${v}" value="${[1,2,4,6][i]}"></label>`).join('')}</div><button type="button" class="lab-action" data-action="coordinate-calc">Calculate</button><p class="calc-output" id="coordinate-calc-result">Distance: 5 units · Midpoint: (2.5, 4)</p></article></div>
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">04 · STRAIGHT LINES</span><h3>Slope and y-intercept</h3><p>In <b>y = mx + c</b>, m is the slope (change in y divided by change in x) and c is the y-intercept, where the line crosses the y-axis.</p><p>Example: y = 2x + 4 has slope 2 and y-intercept 4.</p></article><article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 03</span><h3>Graph an equation</h3><label class="equation-label">Enter y = mx + c<input id="line-equation" value="y = 2x + 4" aria-label="Linear equation"></label><button type="button" class="lab-action" data-action="plot-line">Plot line</button><p id="line-equation-result" class="calc-output">Slope: 2 · Y-intercept: 4</p><svg id="line-graph" class="coordinate-grid line-graph" viewBox="0 0 300 240" role="img" aria-label="Graph of the entered linear equation"><line x1="150" y1="12" x2="150" y2="225" stroke="#20251d"/><line x1="15" y1="120" x2="285" y2="120" stroke="#20251d"/><path id="line-plot" d="M 30 24 L 270 216" fill="none" stroke="#8ebc28" stroke-width="3"/></svg></article></div>`;
        else if (path.id === 'algebra') lesson = `
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">01 · LINEAR POLYNOMIALS</span><h3>Expressions and equations</h3><p>A linear polynomial in one variable has degree 1, for example <b>3x + 5</b>. A polynomial is an expression; an equation includes an equals sign. To find x, solve an equation such as 3x + 5 = 20.</p><p>Subtract 5 from both sides: 3x = 15. Divide by 3: <b>x = 5</b>.</p></article><article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 01</span><h3>Solve ax + b = c</h3><div class="mini-input-grid">${[['eq-a','a',3],['eq-b','b',5],['eq-c','c',20]].map(v=>`<label>${v[1]}<input id="${v[0]}" type="number" value="${v[2]}"></label>`).join('')}</div><button class="lab-action" data-action="solve-linear">Find x</button><p id="linear-solution" class="calc-output">x = 5</p></article></div>
          <article class="lab-lesson"><span class="lesson-number">02 · ALGEBRAIC IDENTITIES</span><h3>Patterns that are always true</h3><p class="formula-strip">(a + b)² = a² + 2ab + b²</p><p class="formula-strip">(a − b)² = a² − 2ab + b²</p><p class="formula-strip">a² − b² = (a − b)(a + b)</p><p class="formula-strip">(x + a)(x + b) = x² + (a+b)x + ab</p><p class="scope-note">Starter identity set. Confirm the exact identity list against the current school-prescribed syllabus before calling this exhaustive.</p></article>
          <article class="lab-lesson"><span class="lesson-number">03 · TWO VARIABLES, ONE LINE</span><h3>Equations in two variables</h3><p>An equation such as x + y = 6 has two variables. Each pair that makes the statement true is a solution: (0,6), (2,4), (6,0). Plotting solutions can reveal a straight line.</p><p class="worked-answer">Try the line tool in Coordinate Geometry with y = −x + 6.</p></article>`;
        else if (path.id === 'geometry') lesson = `
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">01 · CIRCLES</span><h3>Radius, circumference and area</h3><p>A circle is the set of points at a fixed distance (radius r) from its centre. Diameter d = 2r.</p><p class="formula-strip">Circumference = 2πr = πd</p><p class="formula-strip">Area = πr²</p><p class="scope-note">A sector is a part of a circle bounded by two radii and an arc. Sector area = (θ/360°) × πr², where θ is the central angle.</p></article><article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 01</span><h3>Circle calculator</h3><label>Radius (r)<input type="number" id="circle-radius" value="7" min="0" step="any"></label><button class="lab-action" data-action="circle-calc">Calculate</button><p id="circle-result" class="calc-output">Circumference ≈ 43.98 · Area ≈ 153.94</p></article></div>
          <article class="lab-lesson"><span class="lesson-number">02 · TRIANGLES</span><h3>Three ways to find area</h3><p><b>Base and height:</b> A = ½ × b × h.</p><p><b>Equilateral triangle:</b> A = (√3/4) × a², where a is the side length.</p><p><b>Heron's formula:</b> for sides a, b, c, first s = (a+b+c)/2, then A = √[s(s−a)(s−b)(s−c)].</p></article>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 02</span><h3>Triangle area calculator</h3><div class="mini-input-grid"><label>Base<input id="tri-base" type="number" value="8"></label><label>Height<input id="tri-height" type="number" value="5"></label><label>Side a<input id="tri-a" type="number" value="5"></label><label>Side b<input id="tri-b" type="number" value="5"></label><label>Side c<input id="tri-c" type="number" value="6"></label></div><button class="lab-action" data-action="triangle-calc">Calculate areas</button><p id="triangle-result" class="calc-output">Base-height area = 20 square units · Heron's area = 12 square units</p></article>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 03</span><h3>Sector and equilateral triangle</h3><div class="mini-input-grid"><label>Radius<input id="sector-r" type="number" value="6"></label><label>Angle θ (degrees)<input id="sector-angle" type="number" value="90"></label><label>Equilateral side<input id="equilateral-side" type="number" value="4"></label></div><button class="lab-action" data-action="sector-calc">Calculate</button><p id="sector-result" class="calc-output">Sector area = 28.27 square units · Equilateral triangle area = 6.93 square units</p></article>
          <article class="lab-lesson"><span class="lesson-number">03 · QUADRILATERALS</span><h3>Perimeter and area</h3><p><b>Rectangle:</b> A = l×w, P = 2(l+w). <b>Square:</b> A = a², P = 4a.</p><p><b>Parallelogram:</b> A = b×h. <b>Rhombus:</b> A = ½d₁d₂. <b>Trapezium:</b> A = ½(a+b)h, where a and b are parallel sides.</p></article>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 04</span><h3>Quadrilateral calculator</h3><label>Choose a shape<select id="quad-shape"><option value="rectangle">Rectangle</option><option value="square">Square</option><option value="parallelogram">Parallelogram</option><option value="rhombus">Rhombus</option><option value="trapezium">Trapezium</option></select></label><div class="mini-input-grid"><label>Side / base a<input id="quad-a" type="number" value="8"></label><label>Side / base b<input id="quad-b" type="number" value="5"></label><label>Height h<input id="quad-h" type="number" value="4"></label><label>Side c<input id="quad-c" type="number" value="5"></label><label>Side d<input id="quad-d" type="number" value="5"></label><label>Diagonal d₁<input id="quad-d1" type="number" value="6"></label><label>Diagonal d₂<input id="quad-d2" type="number" value="8"></label></div><button class="lab-action" data-action="quad-calc">Calculate area & perimeter</button><p id="quad-result" class="calc-output">Choose a shape and calculate.</p></article>
          <article class="lab-lesson"><span class="lesson-number">05 · SURFACE AREA & VOLUME</span><h3>Measuring 3D objects</h3><p>Surface area measures the outside covering of a solid; volume measures the space it occupies. For a cuboid: volume = lwh, total surface area = 2(lw+lh+wh). For a cube: volume = a³, total surface area = 6a².</p></article>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 05</span><h3>Cube & cuboid calculator</h3><div class="mini-input-grid"><label>Length<input id="solid-l" type="number" value="5"></label><label>Width<input id="solid-w" type="number" value="3"></label><label>Height<input id="solid-h" type="number" value="2"></label></div><button class="lab-action" data-action="solid-calc">Calculate</button><p id="solid-result" class="calc-output">Volume = 30 cubic units · Total surface area = 62 square units</p></article>`;
        else if (path.id === 'probability') lesson = `
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">01 · THEORETICAL PROBABILITY</span><h3>What should happen?</h3><p>When outcomes are equally likely, probability of an event = favourable outcomes ÷ total possible outcomes. A probability is between 0 and 1.</p><p>For a fair coin, P(heads) = 1/2.</p></article><article class="lab-lesson"><span class="lesson-number">02 · EXPERIMENTAL PROBABILITY</span><h3>What actually happens?</h3><p>Experimental probability = number of times the event occurs ÷ total trials. Results can differ from theoretical probability, especially with few trials.</p></article></div>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 01</span><h3>Coin toss simulation</h3><p>Run repeated trials and compare the observed proportion of heads with 0.5.</p><div class="lab-button-row"><button class="lab-action" data-action="coin-sim" data-trials="20">Toss 20</button><button class="lab-action" data-action="coin-sim" data-trials="100">Toss 100</button><button class="lab-action" data-action="coin-sim" data-trials="500">Toss 500</button></div><p id="coin-sim-result" class="calc-output">No tosses yet. The theoretical probability of heads is 0.5.</p></article>
          <article class="lab-lesson"><span class="lesson-number">03 · UNDERSTANDING DATA</span><h3>Mean, median and mode</h3><p><b>Mean:</b> sum of values ÷ number of values. <b>Median:</b> middle value after sorting (or average of two middle values). <b>Mode:</b> most frequent value.</p></article>
          <article class="lab-experiment compact-experiment"><span class="lesson-number">INTERACTIVE EXPERIMENT 02</span><h3>Data analyser</h3><label>Enter numbers separated by commas<input id="data-values" value="4, 6, 6, 8, 10" aria-label="Data values"></label><button class="lab-action" data-action="analyse-data">Analyse data</button><p id="data-result" class="calc-output">Mean: 6.8 · Median: 6 · Mode: 6</p></article>`;
        else lesson = `
          <div class="lab-lesson-grid"><article class="lab-lesson"><span class="lesson-number">01 · NUMBER SYSTEM</span><h3>Different kinds of numbers</h3><p>Natural numbers are counting numbers; whole numbers include zero; integers include negatives. Rational numbers can be written as p/q with q ≠ 0. Irrational numbers cannot be written as such a fraction. Real numbers include rational and irrational numbers.</p></article><article class="lab-lesson"><span class="lesson-number">02 · SEQUENCES & PROGRESSIONS</span><h3>Find the pattern</h3><p>A sequence is an ordered list following a rule. In an arithmetic progression, the difference between consecutive terms is constant. The nth term is a + (n−1)d.</p><div class="mini-input-grid"><label>First term (a)<input id="seq-a" type="number" value="3"></label><label>Common difference (d)<input id="seq-d" type="number" value="4"></label><label>Term number (n)<input id="seq-n" type="number" value="5"></label></div><button class="lab-action" data-action="sequence-calc">Find term</button><p id="sequence-result" class="calc-output">5th term = 19</p></article></div>
          <article class="lab-lesson"><span class="lesson-number">03 · PROPOSITIONS & CONVERSES</span><h3>Statements and reverse statements</h3><p>A proposition is a declarative statement that is either true or false. The converse of “If P, then Q” is “If Q, then P”. A true statement does not automatically make its converse true.</p></article>
          <article class="lab-lesson"><span class="lesson-number">04 · ALGORITHMS</span><h3>Think in clear steps</h3><p>An algorithm is a finite, ordered set of steps for solving a problem. A good algorithm has clear inputs, unambiguous instructions and an output.</p><p class="worked-answer">Example: input two numbers → add them → display the sum.</p></article>`;

        mainContent.innerHTML = `<div class="workspace-page mathlabs-page">${pageHeader("THE MATHEMATICS WORKSHOP","Math Labs","Learn the idea, study a worked example, then experiment. Choose a pathway to begin.")}<section class="lab-pathway-selector"><div class="lab-section-title"><div><span class="lesson-number">YOUR LEARNING PATHWAYS</span><h2>Choose an area to explore</h2></div><span class="path-count">${labPaths.length} PATHWAYS · 14 SYLLABUS TOPICS</span></div><div class="lab-path-tabs">${tabs}</div></section><section class="selected-path-heading"><span class="lesson-number">PATHWAY ${String(labPaths.indexOf(path)+1).padStart(2,'0')}</span><h2>${path.name}</h2><p>${path.desc}</p><p class="syllabus-map">${path.chapters}</p></section><div class="lab-content">${lesson}</div><p class="lab-disclaimer">MathLab is an evolving learning resource. These are structured starter lessons and interactive tools, not a claim that every prescribed subtopic or identity has been covered.</p></div>`;
    }

    function updateCoordinateLab() {
        const xInput = document.getElementById("coordinate-x");
        const yInput = document.getElementById("coordinate-y");

        const visual = document.getElementById("coordinate-visual");
        const description = document.getElementById("coordinate-description");

        if (!xInput || !yInput || !visual || !description) return;

        const x = Number(xInput.value);
        const y = Number(yInput.value);

        if (
            xInput.value === "" ||
            yInput.value === "" ||
            !Number.isInteger(x) ||
            !Number.isInteger(y) ||
            x < -5 || x > 5 ||
            y < -5 || y > 5
        ) {
            visual.innerHTML = `
                <p role="status">
                    Enter valid whole-number coordinates to display the point.
                </p>
            `;
        
            description.textContent =
                "Enter whole numbers between -5 and 5.";
        
            return;
        }

        visual.innerHTML = createCoordinateGrid(x, y);

        description.textContent =
            "(" + x + ", " + y + ") — " +
            getCoordinateDescription(x, y);
    }


    // =====================================================
    // GUIDED EXPERIMENT — COIN TOSS
    // =====================================================

    function renderExperiments() {
        mainContent.innerHTML = `
            <div class="workspace-page">

                ${pageHeader(
                    "GUIDED MATHEMATICS EXPERIMENT",
                    "Investigate probability.",
                    "Run a coin-toss experiment and compare experimental results with theoretical probability."
                )}

                <section class="workspace-panel">

                    <h2>Coin Toss Experiment</h2>

                    <p>
                        A fair coin has two equally likely outcomes:
                        heads and tails.
                    </p>

                    <p>
                        The theoretical probability of heads is 1/2.
                    </p>

                    <div class="experiment-controls">

                        <button type="button"
                            data-action="coin-run"
                            data-trials="10">
                            Run 10 tosses
                        </button>

                        <button type="button"
                            data-action="coin-run"
                            data-trials="50">
                            Run 50 tosses
                        </button>

                        <button type="button"
                            data-action="coin-run"
                            data-trials="100">
                            Run 100 tosses
                        </button>

                    </div>

                    <div id="coin-results" aria-live="polite">

                        <p>
                            Choose the number of tosses to begin.
                        </p>

                    </div>

                </section>

                <section class="workspace-panel">

                    <h2>Think about the result</h2>

                    <ul>
                        <li>Did you get exactly half heads?</li>
                        <li>Did the experimental probability change?</li>
                        <li>What might happen if you perform more tosses?</li>
                    </ul>

                </section>

            </div>
        `;
    }

    function runCoinExperiment(trials) {
        let heads = 0;

        for (let i = 0; i < trials; i++) {
            if (Math.random() < 0.5) {
                heads++;
            }
        }

        const tails = trials - heads;
        const probability = heads / trials;

        stats.labExperiments += 1;

        recordActivity(
            "Completed a coin-toss experiment",
            "Ran " + trials + " simulated tosses."
        );

        const results = document.getElementById("coin-results");

        if (!results) return;

        results.innerHTML = `
            <div class="experiment-results">

                <h3>Experiment results</h3>

                <p>Total tosses: <strong>${trials}</strong></p>

                <p>Heads: <strong>${heads}</strong></p>

                <p>Tails: <strong>${tails}</strong></p>

                <p>
                    Experimental probability of heads:
                    <strong>${heads}/${trials}</strong>
                </p>

                <p>
                    Decimal value:
                    <strong>${probability.toFixed(3)}</strong>
                </p>

                <p>
                    Theoretical probability:
                    <strong>0.5</strong>
                </p>

            </div>
        `;
    }


    // =====================================================
    // PRACTICE MODE
    // =====================================================

    function selectRandomQuestion() {
        const index = Math.floor(Math.random() * questionBank.length);

        return questionBank[index];
    }

    function renderPractice() {
        if (!state.practiceQuestion) {
            state.practiceQuestion = selectRandomQuestion();
        }

        const question = state.practiceQuestion;

        let resultHTML = "";

        if (state.practiceAnswered) {
            resultHTML = `
                <div class="practice-feedback">
                    <h3>Answer checked</h3>

                    <p>
                        ${isCorrectAnswer(
                            state.lastPracticeAnswer || "",
                            question
                        )
                            ? "Correct!"
                            : "Not quite. The correct answer is " +
                                escapeHTML(question.answer) + "."}
                    </p>

                    <p>${escapeHTML(question.explanation)}</p>

                    <button type="button"
                        data-action="next-practice">
                        Next question
                    </button>
                </div>
            `;
        }

        mainContent.innerHTML = `
            <div class="workspace-page">

                ${pageHeader(
                    "PRACTICE WORKSPACE",
                    "Build problem-solving skills.",
                    "Try a question, use a hint if needed, and understand the explanation."
                )}

                <section class="workspace-panel">

                    <p class="panel-kicker">
                        ${escapeHTML(getQuestionChapterName(question))}
                    </p>

                    <h2>${escapeHTML(question.question)}</h2>

                    ${
                        state.practiceHintShown && !state.practiceAnswered
                            ? `<p class="practice-hint">${escapeHTML(question.hint)}</p>`
                            : ""
                    }

                    ${
                        state.practiceAnswered
                            ? resultHTML
                            : `
                                <form id="practice-form">

                                    <label for="practice-answer">
                                        Your answer
                                    </label>

                                    <input
                                        id="practice-answer"
                                        type="text"
                                        autocomplete="off"
                                        required>

                                    <button type="submit">
                                        Check answer
                                    </button>

                                </form>

                                <button type="button"
                                    data-action="practice-hint">
                                    Show hint
                                </button>
                            `
                    }

                </section>

            </div>
        `;
    }


    // =====================================================
    // CHALLENGE MODE
    // Five questions, five minutes, scored out of 50.
    // A hint reduces the available points for that question.
    // =====================================================

    function shuffleQuestions() {
        const copy = questionBank.slice();

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            const temp = copy[i];
            copy[i] = copy[j];
            copy[j] = temp;
        }

        return copy.slice(0, 5);
    }

    function startChallenge() {
        stopChallengeTimer();

        state.challenge = {
            questions: shuffleQuestions(),
            index: 0,
            score: 0,
            correct: 0,
            answered: false,
            answerCorrect: false,
            hintShown: false,
            remainingSeconds: 300,
            deadline: Date.now() + 300000,
            finished: false,
            timedOut: false
        };

        recordActivity(
            "Started Challenge Mode",
            "Started a five-question mathematics challenge."
        );

        renderChallenge();
        startChallengeTimer();
    }

    function stopChallengeTimer() {
        if (state.challengeTimer) {
            clearInterval(state.challengeTimer);
            state.challengeTimer = null;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0");
    }

    function updateChallengeTimer() {
        const session = state.challenge;
    
        if (!session || session.finished) return;
    
        const remainingMilliseconds = session.deadline - Date.now();
    
        session.remainingSeconds = Math.max(
            0,
            Math.ceil(remainingMilliseconds / 1000)
        );
    
        const timer = document.getElementById("challenge-timer");
    
        if (timer) {
            timer.textContent = formatTime(session.remainingSeconds);
        }
    
        if (session.remainingSeconds <= 0) {
            session.timedOut = true;
            finishChallenge();
        }
    }
    
    function startChallengeTimer() {
        stopChallengeTimer();
    
        updateChallengeTimer();
    
        if (!state.challenge || state.challenge.finished) return;
    
        state.challengeTimer = setInterval(function () {
            updateChallengeTimer();
        }, 1000);
    }

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden && state.challenge && !state.challenge.finished) {
            updateChallengeTimer();
        }
    });

    function finishChallenge() {
        const session = state.challenge;
    
        if (!session || session.finished) return;
    
        session.finished = true;
    
        stopChallengeTimer();
    
        const completed =
            session.index === session.questions.length - 1 &&
            session.answered;
    
        if (completed) {
            stats.challengesCompleted += 1;
    
            if (!stats.completedChallengeDates.includes(getTodayKey())) {
                stats.completedChallengeDates.push(getTodayKey());
            }
        }
    
        stats.challengeHistory.unshift({
            date: getTodayKey(),
            score: session.score,
            correct: session.correct,
            total: session.questions.length,
            timedOut: session.timedOut,
            completed: completed
        });
    
        stats.challengeHistory =
            stats.challengeHistory.slice(0, 20);
    
        recordActivity(
            completed ? "Completed Challenge Mode" : "Challenge attempt ended",
            "Scored " + session.score + " out of 50." +
            (completed ? "" : " The challenge was not fully completed.")
        );
    
        renderChallenge();
    }

    function renderChallenge() {
        const session = state.challenge;

        if (!session) {
            mainContent.innerHTML = `
                <div class="workspace-page">

                    ${pageHeader(
                        "TEST YOUR UNDERSTANDING",
                        "Challenge Mode.",
                        "Take a timed five-question challenge using a selection of starter mathematics questions."
                    )}

                    <section class="workspace-panel">

                        <h2>Ready to begin?</h2>

                        <div class="challenge-rules">

                            <p><strong>Questions:</strong> 5</p>
                            <p><strong>Time limit:</strong> 5 minutes</p>
                            <p><strong>Maximum score:</strong> 50 points</p>
                            <p><strong>Hints:</strong> Available, but reduce points for that question.</p>

                        </div>

                        <button type="button"
                            data-action="start-challenge">
                            Start Challenge
                        </button>

                    </section>

                    <section class="workspace-panel">
                        <h2>Previous attempts</h2>
                        ${renderChallengeHistory()}
                    </section>

                </div>
            `;

            return;
        }

        if (session.finished) {
            mainContent.innerHTML = `
                <div class="workspace-page">

                    ${pageHeader(
                        "CHALLENGE RESULTS",
                        session.timedOut ? "Time is up." : "Challenge completed.",
                        "Review your result and decide what to practise next."
                    )}

                    <section class="workspace-panel">

                        <h2>Your score</h2>

                        <p class="challenge-final-score">
                            ${session.score} / 50
                        </p>

                        <p>
                            Correct answers:
                            ${session.correct} / ${session.questions.length}
                        </p>

                        <p>
                            ${
                                session.timedOut
                                    ? "The timer reached zero."
                                    : "You completed all five questions."
                            }
                        </p>

                        <button type="button"
                            data-action="restart-challenge">
                            Try another challenge
                        </button>

                    </section>

                    <section class="workspace-panel">
                        <h2>Previous attempts</h2>
                        ${renderChallengeHistory()}
                    </section>

                </div>
            `;

            return;
        }

        const question = session.questions[session.index];

        const questionNumber = session.index + 1;

        mainContent.innerHTML = `
            <div class="workspace-page">

                ${pageHeader(
                    "CHALLENGE MODE",
                    "Think carefully. Solve clearly.",
                    "Question " + questionNumber + " of 5"
                )}

                <section class="workspace-panel">

                    <div class="challenge-status-row">

                        <span>
                            Question ${questionNumber}/5
                        </span>

                        <strong id="challenge-timer">
                            ${formatTime(session.remainingSeconds)}
                        </strong>

                        <span>
                            Score: ${session.score}/50
                        </span>

                    </div>

                    <p class="panel-kicker">
                        ${escapeHTML(getQuestionChapterName(question))}
                    </p>

                    <h2>${escapeHTML(question.question)}</h2>

                    ${
                        session.hintShown
                            ? `<p class="practice-hint">${escapeHTML(question.hint)}</p>`
                            : ""
                    }

                    ${
                        session.answered
                            ? `
                                <div class="challenge-feedback">

                                    <h3>
                                        ${session.answerCorrect ? "Correct!" : "Incorrect"}
                                    </h3>

                                    <p>${escapeHTML(question.explanation)}</p>

                                    <p>
                                        Correct answer:
                                        <strong>${escapeHTML(question.answer)}</strong>
                                    </p>

                                    <button type="button"
                                        data-action="next-challenge">
                                        ${
                                            questionNumber === 5
                                                ? "Finish challenge"
                                                : "Next question"
                                        }
                                    </button>

                                </div>
                            `
                            : `
                                <form id="challenge-answer-form">

                                    <label for="challenge-answer">
                                        Your answer
                                    </label>

                                    <input
                                        id="challenge-answer"
                                        type="text"
                                        autocomplete="off"
                                        required>

                                    <button type="submit">
                                        Submit answer
                                    </button>

                                </form>

                                <button type="button"
                                    data-action="challenge-hint">
                                    Use a hint
                                </button>
                            `
                    }

                </section>

            </div>
        `;
    }

    function renderChallengeHistory() {
        if (!stats.challengeHistory.length) {
            return "<p>No challenge attempts recorded yet.</p>";
        }

        return `
            <div class="challenge-history">
                ${stats.challengeHistory.map(function (item) {
                    return `
                        <div class="activity-item">
                            <div>
                                <strong>
                                    ${item.score}/${item.total * 10} points
                                </strong>

                                <p>
                                    ${formatDate(item.date)}
                                    · ${item.correct}/${item.total} correct
                                </p>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }


    // =====================================================
    // FORMULA LIBRARY
    // Starter reference list, not an exhaustive syllabus.
    // =====================================================

    const formulas = [

        {
            chapterId: "circles",
            name: "Diameter of a circle",
            formula: "d = 2r",
            description: "Diameter is twice the radius."
        },

        {
            chapterId: "circles",
            name: "Circumference of a circle",
            formula: "C = 2πr",
            description: "Circumference in terms of radius."
        },

        {
            chapterId: "measuring-space-perimeter-and-area",
            name: "Perimeter of a rectangle",
            formula: "P = 2(l + b)",
            description: "Twice the sum of length and breadth."
        },

        {
            chapterId: "measuring-space-perimeter-and-area",
            name: "Area of a rectangle",
            formula: "A = l × b",
            description: "Length multiplied by breadth."
        },

        {
            chapterId: "measuring-space-perimeter-and-area",
            name: "Area of a square",
            formula: "A = a²",
            description: "Side multiplied by itself."
        },

        {
            chapterId: "quadrilaterals",
            name: "Interior angle sum of a quadrilateral",
            formula: "360°",
            description: "The interior angles add up to 360 degrees."
        },

        {
            chapterId: "exploring-algebraic-identities",
            name: "Square of a sum",
            formula: "(a + b)² = a² + 2ab + b²",
            description: "A standard algebraic identity."
        },

        {
            chapterId: "exploring-algebraic-identities",
            name: "Square of a difference",
            formula: "(a - b)² = a² - 2ab + b²",
            description: "A standard algebraic identity."
        },

        {
            chapterId: "exploring-algebraic-identities",
            name: "Difference of two squares",
            formula: "a² - b² = (a - b)(a + b)",
            description: "Factorisation identity."
        },

        {
            chapterId: "surface-area-and-volume",
            name: "Volume of a cube",
            formula: "V = a³",
            description: "Side multiplied by itself three times."
        },

        {
            chapterId: "surface-area-and-volume",
            name: "Volume of a cuboid",
            formula: "V = l × b × h",
            description: "Length multiplied by breadth and height."
        },

        {
            chapterId: "introduction-to-probability",
            name: "Basic probability",
            formula: "P(E) = Favourable outcomes / Total equally likely outcomes",
            description: "For a finite set of equally likely outcomes."
        }

    ];

    function renderFormulaResults(searchTerm) {
        const term = String(searchTerm || "").toLowerCase();
    
        const filtered = formulas.filter(function (item) {
            return (
                item.name.toLowerCase().includes(term) ||
                item.formula.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term) ||
                getQuestionChapterName({ chapterId: item.chapterId })
                    .toLowerCase()
                    .includes(term)
            );
        });
    
        if (!filtered.length) {
            return "<p>No matching formulas found.</p>";
        }
    
        return filtered.map(function (item) {
            return `
                <article class="formula-card">
    
                    <p class="panel-kicker">
                        ${escapeHTML(getQuestionChapterName({
                            chapterId: item.chapterId
                        }))}
                    </p>
    
                    <h3>${escapeHTML(item.name)}</h3>
    
                    <p class="formula-expression">
                        ${escapeHTML(item.formula)}
                    </p>
    
                    <p>${escapeHTML(item.description)}</p>
    
                </article>
            `;
        }).join("");
    }
    
    function renderFormulas(searchTerm) {
        mainContent.innerHTML = `
            <div class="workspace-page">
    
                ${pageHeader(
                    "MATHEMATICS REFERENCE",
                    "Formula Library.",
                    "Search a starter collection of mathematical formulas and their meanings."
                )}
    
                <section class="workspace-panel">
    
                    <label for="formula-search">
                        Search formulas
                    </label>
    
                    <input
                        id="formula-search"
                        type="search"
                        placeholder="Search by formula or chapter..."
                        value="${escapeHTML(searchTerm || "")}">
    
                    <div id="formula-results">
                        ${renderFormulaResults(searchTerm)}
                    </div>
    
                    <p class="learn-source-note">
                        This is a starter reference collection, not a complete
                        or official chapter-wise formula list.
                    </p>
    
                </section>
    
            </div>
        `;
    }


    // =====================================================
    // PROGRESS DASHBOARD
    // =====================================================

    function renderProgress() {
        const chapterCount =
            curriculum && Array.isArray(curriculum.chapters)
                ? curriculum.chapters.length
                : 14;

        const exploredCount = stats.topicsOpened.length;

        const chapterPercentage = chapterCount
            ? Math.round((exploredCount / chapterCount) * 100)
            : 0;

        const practiceAccuracy = stats.practiceAnswered
            ? Math.round(
                (stats.practiceCorrect / stats.practiceAnswered) * 100
            )
            : 0;

        mainContent.innerHTML = `
            <div class="workspace-page">

                ${pageHeader(
                    "YOUR LEARNING RECORD",
                    "Track your progress.",
                    "Your activity and results are saved locally in this browser."
                )}

                <section class="progress-stat-grid">

                    <article class="stat-card">
                        <p class="stat-label">Chapters explored</p>
                        <p class="stat-value">
                            ${exploredCount}/${chapterCount}
                        </p>
                    </article>

                    <article class="stat-card">
                        <p class="stat-label">Challenges completed</p>
                        <p class="stat-value">
                            ${stats.challengesCompleted}
                        </p>
                    </article>

                    <article class="stat-card">
                        <p class="stat-label">Practice questions</p>
                        <p class="stat-value">
                            ${stats.practiceAnswered}
                        </p>
                    </article>

                    <article class="stat-card">
                        <p class="stat-label">Lab experiments</p>
                        <p class="stat-value">
                            ${stats.labExperiments}
                        </p>
                    </article>

                </section>

                <section class="workspace-panel">

                    <h2>Chapter exploration</h2>

                    <p>
                        ${chapterPercentage}% of the chapters have been opened.
                    </p>

                    <progress
                        value="${exploredCount}"
                        max="${chapterCount}">
                    </progress>

                </section>

                <section class="workspace-panel">

                    <h2>Practice accuracy</h2>

                    <p>
                        ${
                            stats.practiceAnswered
                                ? practiceAccuracy + "% correct"
                                : "Complete practice questions to build your record."
                        }
                    </p>

                    <progress
                        value="${practiceAccuracy}"
                        max="100">
                    </progress>

                </section>

                <section class="workspace-panel">

                    <h2>Recently explored chapters</h2>

                    ${
                        stats.topicsOpened.length
                            ? `
                                <ul>
                                    ${stats.topicsOpened.map(function (topic) {
                                        return "<li>" + escapeHTML(topic) + "</li>";
                                    }).join("")}
                                </ul>
                            `
                            : "<p>No chapters explored yet. Start with Learn.</p>"
                    }

                </section>

                <section class="workspace-panel">

                    <h2>Recent activity</h2>

                    ${
                        stats.activity.length
                            ? `
                                <div class="activity-list">
                                    ${stats.activity.map(function (item) {
                                        return `
                                            <div class="activity-item">
                                                <div>
                                                    <strong>${escapeHTML(item.title)}</strong>
                                                    <p>${escapeHTML(item.description)}</p>
                                                    <small>${formatDate(item.date)}</small>
                                                </div>
                                            </div>
                                        `;
                                    }).join("")}
                                </div>
                            `
                            : "<p>Your learning activity will appear here.</p>"
                    }

                </section>

                <p class="learn-source-note">
                    Progress is stored in this browser only. Clearing browser
                    data or changing devices can remove or separate this record.
                </p>

            </div>
        `;
    }


    // =====================================================
    // TOOL RENDERING
    // =====================================================

    function renderTool(toolName, updateHistory) {
        if (!tools.some(tool => tool.id === toolName)) toolName = "labs";
        state.activeTool = toolName;
        updateToolNavigation();
        if (updateHistory !== false) {
            const nextHash = toolToHash[toolName];
            if (nextHash && location.hash !== nextHash) history.pushState({mathlabTool:toolName}, "", nextHash);
        }
        try {
            if (toolName === "labs") renderLabs();
            else if (toolName === "practice") renderPractice();
            else if (toolName === "challenge") renderChallenge();
            else if (toolName === "formulas") renderFormulas("");
        } catch (error) {
            console.error("MathLab rendering error:", error);
            renderError("This section could not be displayed. Please try again.");
        }
    }

    // =====================================================
    // CLICK EVENTS
    // =====================================================

    document.addEventListener("click", function (event) {
        const target = event.target;

        if (!target || typeof target.closest !== "function") {
            return;
        }

        // Internal workspace navigation.
        const toolButton = target.closest("[data-tool]");

        if (toolButton) {
            event.preventDefault();
            renderTool(toolButton.dataset.tool);
            return;
        }

        // Temporary compatibility with the previous index.html.
        const oldPageLink = target.closest("[data-page]");

        if (oldPageLink) {
            const page = oldPageLink.dataset.page;

            const mapping = {
                dashboard: "labs", learn: "labs", labs: "labs",
                practice: "practice", challenges: "challenge", formulas: "formulas"
            };

            if (mapping[page]) {
                event.preventDefault();
                renderTool(mapping[page]);
                return;
            }
        }

        const grid = target.closest("#click-grid");
        if (grid) {
            const rect=grid.getBoundingClientRect(); const x=Math.max(-5,Math.min(5,Math.round(((event.clientX-rect.left)/rect.width*300-150)/24)));
            const y=Math.max(-5,Math.min(5,Math.round((150-(event.clientY-rect.top)/rect.height*300)/24)));
            const px=150+x*24, py=150-y*24; const dot=document.getElementById("plotted-point"), label=document.getElementById("plotted-label");
            dot.setAttribute("cx",px); dot.setAttribute("cy",py); label.setAttribute("x",px+9); label.setAttribute("y",py-9); label.textContent=`(${x}, ${y})`;
            document.getElementById("point-result").textContent=`(${x}, ${y})`;
            document.getElementById("point-quadrant").textContent=x===0&&y===0?"Origin":x===0?"On the y-axis":y===0?"On the x-axis":x>0&&y>0?"Quadrant I":x<0&&y>0?"Quadrant II":x<0&&y<0?"Quadrant III":"Quadrant IV";
            return;
        }
        const pathButton = target.closest("[data-path]");
        if (pathButton) { renderLabs(pathButton.dataset.path); return; }

        const actionButton = target.closest("[data-action]");
        if (!actionButton) return;

        const action = actionButton.dataset.action;

        if (action === "return-learn") {
            renderTool("chapters");
            return;
        }

        if (action === "start-challenge" ||
            action === "restart-challenge") {
            startChallenge();
            return;
        }

        if (action === "challenge-hint") {
            if (state.challenge && !state.challenge.answered) {
                state.challenge.hintShown = true;
                renderChallenge();
            }
            return;
        }

        if (action === "next-challenge") {
            const session = state.challenge;

            if (!session) return;

            if (session.index >= session.questions.length - 1) {
                finishChallenge();
            } else {
                session.index++;
                session.answered = false;
                session.answerCorrect = false;
                session.hintShown = false;
                renderChallenge();
            }

            return;
        }

        if (action === "practice-hint") {
            state.practiceHintShown = true;
            renderPractice();
            return;
        }

        if (action === "next-practice") {
            state.practiceQuestion = selectRandomQuestion();
            state.practiceAnswered = false;
            state.practiceHintShown = false;
            state.lastPracticeAnswer = "";
            renderPractice();
            return;
        }

        if (action === "coordinate-calc") {
            const v = id => Number(document.getElementById(id).value);
            const x1=v("x1"), y1=v("y1"), x2=v("x2"), y2=v("y2");
            const out=document.getElementById("coordinate-calc-result");
            if ([x1,y1,x2,y2].every(Number.isFinite)) out.textContent=`Distance: ${Math.hypot(x2-x1,y2-y1).toFixed(3)} units · Midpoint: (${((x1+x2)/2).toFixed(2)}, ${((y1+y2)/2).toFixed(2)})`;
            return;
        }
        if (action === "plot-line") {
            const raw=document.getElementById("line-equation").value.replace(/\s+/g,"").toLowerCase();
            const match=raw.match(/^y=([+-]?\d*\.?\d*)x([+-]\d*\.?\d+)?$/);
            const out=document.getElementById("line-equation-result");
            if (!match) { out.textContent="Use the form y = mx + c, for example y = 2x + 4."; return; }
            const m=match[1]===""||match[1]==="+"?1:match[1]==="-"?-1:Number(match[1]); const c=match[2]?Number(match[2]):0;
            out.textContent=`Slope: ${m} · Y-intercept: ${c}`;
            const pts=[]; for(let x=-5;x<=5;x+=0.25){const y=m*x+c;pts.push(`${x===-5?'M':'L'} ${150+x*24} ${120-y*18}`)}
            document.getElementById("line-plot").setAttribute("d",pts.join(" ")); return;
        }
        if (action === "solve-linear") {
            const a=Number(document.getElementById("eq-a").value), b=Number(document.getElementById("eq-b").value), c=Number(document.getElementById("eq-c").value);
            document.getElementById("linear-solution").textContent=a===0?(b===c?"Every value of x satisfies this equation.":"No solution."):`x = ${((c-b)/a).toFixed(4).replace(/\.?0+$/,'')}`; return;
        }
        if (action === "circle-calc") {
            const r=Number(document.getElementById("circle-radius").value); document.getElementById("circle-result").textContent=r<0?"Radius cannot be negative.":`Circumference = ${(2*Math.PI*r).toFixed(2)} units · Area = ${(Math.PI*r*r).toFixed(2)} square units`; return;
        }
        if (action === "triangle-calc") {
            const g=id=>Number(document.getElementById(id).value), base=g("tri-base"),h=g("tri-height"),a=g("tri-a"),b=g("tri-b"),c=g("tri-c"),sp=(a+b+c)/2;
            const heron=(a>0&&b>0&&c>0&&a+b>c&&a+c>b&&b+c>a)?Math.sqrt(sp*(sp-a)*(sp-b)*(sp-c)):NaN;
            document.getElementById("triangle-result").textContent=`Base-height area = ${(base*h/2).toFixed(2)} · Heron's area = ${Number.isFinite(heron)?heron.toFixed(2):"invalid side lengths"} square units`; return;
        }
        if (action === "sector-calc") {
            const r=Number(document.getElementById("sector-r").value), angle=Number(document.getElementById("sector-angle").value), side=Number(document.getElementById("equilateral-side").value);
            document.getElementById("sector-result").textContent=r<0||angle<0||angle>360||side<0?"Enter a non-negative radius/side and an angle from 0° to 360°.":`Sector area = ${(angle/360*Math.PI*r*r).toFixed(2)} square units · Equilateral triangle area = ${(Math.sqrt(3)/4*side*side).toFixed(2)} square units`; return;
        }
        if (action === "quad-calc") {
            const g=id=>Number(document.getElementById(id).value), shape=document.getElementById("quad-shape").value, a=g("quad-a"),b=g("quad-b"),h=g("quad-h"),c=g("quad-c"),d=g("quad-d"),d1=g("quad-d1"),d2=g("quad-d2"); let area=0,perimeter=0;
            if(shape==="rectangle"){area=a*b;perimeter=2*(a+b)} else if(shape==="square"){area=a*a;perimeter=4*a} else if(shape==="parallelogram"){area=a*h;perimeter=2*(a+b)} else if(shape==="rhombus"){area=d1*d2/2;perimeter=4*a} else {area=(a+b)*h/2;perimeter=a+b+c+d}
            document.getElementById("quad-result").textContent=`Area = ${area.toFixed(2)} square units · Perimeter ≈ ${perimeter.toFixed(2)} units (enter valid dimensions for your selected shape)`; return;
        }
        if (action === "solid-calc") {
            const g=id=>Number(document.getElementById(id).value),l=g("solid-l"),w=g("solid-w"),h=g("solid-h"); document.getElementById("solid-result").textContent=`Volume = ${(l*w*h).toFixed(2)} cubic units · Total surface area = ${(2*(l*w+l*h+w*h)).toFixed(2)} square units`; return;
        }
        if (action === "coin-sim") {
            const n=Number(actionButton.dataset.trials); let heads=0; for(let i=0;i<n;i++) if(Math.random()<0.5) heads++;
            document.getElementById("coin-sim-result").textContent=`${heads} heads out of ${n} tosses · Experimental probability = ${(heads/n).toFixed(3)} · Theoretical = 0.500`; return;
        }
        if (action === "analyse-data") {
            const nums=document.getElementById("data-values").value.split(",").map(Number);
            if(!nums.length||nums.some(n=>!Number.isFinite(n))){document.getElementById("data-result").textContent="Enter valid numbers separated by commas.";return;}
            const sorted=[...nums].sort((a,b)=>a-b), mid=Math.floor(sorted.length/2), median=sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
            const counts={}; nums.forEach(n=>counts[n]=(counts[n]||0)+1); const max=Math.max(...Object.values(counts)); const modes=Object.keys(counts).filter(k=>counts[k]===max);
            document.getElementById("data-result").textContent=`Mean: ${(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2)} · Median: ${median} · Mode: ${max===1?"No repeated mode":modes.join(", ")}`; return;
        }
        if (action === "sequence-calc") {
            const a=Number(document.getElementById("seq-a").value),d=Number(document.getElementById("seq-d").value),n=Number(document.getElementById("seq-n").value);
            document.getElementById("sequence-result").textContent=n<1||!Number.isInteger(n)?"Term number must be a positive whole number.":`${n}${n===1?"st":n===2?"nd":n===3?"rd":"th"} term = ${a+(n-1)*d}`; return;
        }
        if (action === "coin-run") {
            const trials = Number(actionButton.dataset.trials);

            if ([10, 50, 100].includes(trials)) {
                runCoinExperiment(trials);
            }

            return;
        }
    });


    // =====================================================
    // FORM SUBMISSION
    // =====================================================

    mainContent.addEventListener("submit", function (event) {
        const form = event.target;

        if (form.id === "challenge-answer-form") {
            event.preventDefault();

            const input = document.getElementById("challenge-answer");
            const session = state.challenge;
            
            if (!input || !session || session.answered || session.finished) return;
            
            // Check the deadline before accepting an answer.
            updateChallengeTimer();
            
            if (session.finished) return;

            const question = session.questions[session.index];
            const answer = input.value.trim();

            if (!answer) return;

            const correct = isCorrectAnswer(answer, question);

            session.answered = true;
            session.answerCorrect = correct;

            if (correct) {
                session.correct++;

                session.score += session.hintShown ? 5 : 10;
            }

            renderChallenge();
            return;
        }

        if (form.id === "practice-form") {
            event.preventDefault();

            const input = document.getElementById("practice-answer");

            if (!input || state.practiceAnswered) return;

            const answer = input.value.trim();

            if (!answer) return;

            const question = state.practiceQuestion;
            const correct = isCorrectAnswer(answer, question);

            state.practiceAnswered = true;
            state.lastPracticeAnswer = answer;

            stats.practiceAnswered++;

            if (correct) {
                stats.practiceCorrect++;
            }

            recordActivity(
                correct ? "Solved a practice question" : "Attempted a practice question",
                getQuestionChapterName(question)
            );

            renderPractice();
        }
    });


    // =====================================================
    // LIVE INPUT EVENTS
    // =====================================================

    mainContent.addEventListener("input", function (event) {
        const target = event.target;

        if (
            target.id === "coordinate-x" ||
            target.id === "coordinate-y"
        ) {
            updateCoordinateLab();
            return;
        }

        if (target.id === "formula-search") {
            const cursorPosition = target.selectionStart;
            const searchTerm = target.value;
        
            renderFormulas(searchTerm);
        
            const replacement = document.getElementById("formula-search");
        
            if (replacement) {
                replacement.focus();
        
                try {
                    replacement.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                    );
                } catch (error) {
                    // Some browsers do not support selection on search inputs.
                }
            }
        }
    });


    // =====================================================
    // HASH / INITIAL NAVIGATION
    // =====================================================
    const hashToTool = {
        "#labs":"labs", "#learn":"labs", "#dashboard":"labs",
        "#practice":"practice", "#challenges":"challenge", "#formulas":"formulas",
        "#experiments":"labs", "#progress":"labs"
    };
    const toolToHash = { labs:"#labs", practice:"#practice", challenge:"#challenges", formulas:"#formulas" };
    function syncToolFromLocation() {
        const requested = hashToTool[location.hash] || "labs";
        if (requested !== state.activeTool) renderTool(requested, false);
        if (!hashToTool[location.hash]) history.replaceState(null, "", "#labs");
    }
    window.addEventListener("popstate", syncToolFromLocation);
    window.addEventListener("hashchange", syncToolFromLocation);
    const initialTool = hashToTool[location.hash] || "labs";
    if (!hashToTool[location.hash]) history.replaceState(null, "", "#labs");
    renderTool(initialTool, false);
    console.log("MathLab V1 initialized successfully.");

});
