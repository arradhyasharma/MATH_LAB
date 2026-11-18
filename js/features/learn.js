
(function () {
    "use strict";

    const curriculum = window.MATHLAB_CLASS9_CURRICULUM;

    let selectedChapterId = "";
    let selectedSubjectId = "";
    let activeView = "chapters";


    // ==========================================
    // HTML SAFETY
    // ==========================================

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[c];
        });
    }


    // ==========================================
    // FIND CHAPTER AND SUBJECT
    // ==========================================

    function findChapter(id) {

        if (!curriculum || !Array.isArray(curriculum.chapters)) {
            return null;
        }

        return curriculum.chapters.find(function (chapter) {
            return chapter.id === id;
        }) || null;
    }


    function findSubject(id) {

        if (!curriculum || !Array.isArray(curriculum.subjectAreas)) {
            return null;
        }

        return curriculum.subjectAreas.find(function (subject) {
            return subject.id === id;
        }) || null;
    }


    function getSubjectName(chapter) {

        const subject = findSubject(chapter.subjectId);

        return subject ? subject.name : "Unclassified";
    }


    // ==========================================
    // MAIN NAVIGATION
    // ==========================================

    function renderNavigation() {

        return `

            <div class="learn-section-heading">

                <div>
                    <p class="panel-kicker">YOUR COURSE MAP</p>
                    <h2>Explore Mathematics</h2>
                </div>

                <span class="learn-syllabus-label">
                    UPDATED SYLLABUS
                </span>

            </div>


            <div class="learn-chapter-list">

                <button
                    class="learn-chapter-card ${activeView === "chapters" ? "selected" : ""}"
                    type="button"
                    data-learn-view="chapters">

                    <span class="learn-chapter-number">
                        01
                    </span>

                    <span class="learn-chapter-copy">

                        <strong>All Chapters</strong>

                        <span>
                            Browse all 14 chapters in syllabus order
                        </span>

                    </span>

                    <span class="learn-chapter-status">
                        Open ↗
                    </span>

                </button>


                <button
                    class="learn-chapter-card ${activeView === "subjects" ? "selected" : ""}"
                    type="button"
                    data-learn-view="subjects">

                    <span class="learn-chapter-number">
                        02
                    </span>

                    <span class="learn-chapter-copy">

                        <strong>Explore by Subject</strong>

                        <span>
                            Browse Mathematics by subject area
                        </span>

                    </span>

                    <span class="learn-chapter-status">
                        Open ↗
                    </span>

                </button>

            </div>

        `;
    }


    // ==========================================
    // CHAPTER CARDS
    // ==========================================

    function renderChapterCards(chapters, stats) {

        const openedTopics =
            stats && Array.isArray(stats.topicsOpened)
                ? stats.topicsOpened
                : [];


        return chapters.map(function (chapter) {

            const opened = openedTopics.includes(chapter.name);

            return `

                <button
                    class="learn-chapter-card ${selectedChapterId === chapter.id ? "selected" : ""}"
                    type="button"
                    data-learn-chapter="${escapeHTML(chapter.id)}">


                    <span class="learn-chapter-number">
                        ${escapeHTML(chapter.number)}
                    </span>


                    <span class="learn-chapter-copy">

                        <strong>
                            ${escapeHTML(chapter.name)}
                        </strong>

                        <span>
                            ${escapeHTML(getSubjectName(chapter))}
                        </span>

                    </span>


                    <span class="learn-chapter-status">
                        ${opened ? "Explored" : "Open"} ↗
                    </span>


                </button>

            `;

        }).join("");
    }


    // ==========================================
    // SUBJECT CARDS
    // ==========================================

    function renderSubjectCards() {

        return curriculum.subjectAreas.map(function (subject, index) {

            const count = subject.chapterIds.length;

            const groupLabel =
                subject.curriculumGroup === "additional"
                    ? "Additional subject area"
                    : "Core mathematics area";


            return `

                <button
                    class="learn-chapter-card"
                    type="button"
                    data-learn-subject="${escapeHTML(subject.id)}">


                    <span class="learn-chapter-number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>


                    <span class="learn-chapter-copy">

                        <strong>
                            ${escapeHTML(subject.name)}
                        </strong>

                        <span>
                            ${escapeHTML(subject.description)}
                            · ${escapeHTML(groupLabel)}
                        </span>

                    </span>


                    <span class="learn-chapter-status">
                        ${count} ${count === 1 ? "chapter" : "chapters"} ↗
                    </span>


                </button>

            `;

        }).join("");
    }


    // ==========================================
    // CHAPTER LIBRARY PAGE
    // ==========================================

    function renderLibrary(container, stats) {

        const chapters = curriculum.chapters;


        const openedTopics =
            stats && Array.isArray(stats.topicsOpened)
                ? stats.topicsOpened
                : [];


        const exploredCount = chapters.filter(function (chapter) {

            return openedTopics.includes(chapter.name);

        }).length;


        let contentHTML = "";


        // SUBJECT DETAIL PAGE
        if (selectedSubjectId) {

            const subject = findSubject(selectedSubjectId);


            const subjectChapters = subject

                ? subject.chapterIds
                    .map(findChapter)
                    .filter(Boolean)

                : [];


            contentHTML = `

                <button
                    class="learn-back-button"
                    type="button"
                    data-learn-subject-back>

                    ← Back to subject areas

                </button>


                <div class="learn-section-heading">

                    <div>

                        <p class="panel-kicker">
                            SUBJECT AREA
                        </p>

                        <h2>
                            ${subject ? escapeHTML(subject.name) : "Subject"}
                        </h2>

                    </div>


                    <span class="learn-syllabus-label">
                        ${subjectChapters.length} CHAPTERS
                    </span>

                </div>


                <div class="learn-chapter-list">

                    ${renderChapterCards(subjectChapters, stats)}

                </div>

            `;


        }

        // SUBJECT LIBRARY
        else if (activeView === "subjects") {

            contentHTML = `

                <div class="learn-chapter-list">

                    ${renderSubjectCards()}

                </div>


                <p class="learn-source-note">

                    Subject areas are a navigation and classification
                    layer. The six core areas and the additional
                    Algorithms category help organise the chapters.
                    The original chapter order remains unchanged.

                </p>

            `;


        }

        // ALL CHAPTERS
        else {

            contentHTML = `

                <div class="learn-chapter-list">

                    ${renderChapterCards(chapters, stats)}

                </div>


                <p class="learn-source-note">

                    Chapter titles and order follow the updated syllabus
                    supplied for this MathLab project. Detailed lesson
                    content and official chapter-wise subtopics have
                    not yet been added.

                </p>

            `;

        }


        container.innerHTML = `

            <div class="learn-page">


                <section class="learn-hero">

                    <p class="eyebrow">

                        CLASS IX · CBSE
                        ${escapeHTML(curriculum.academicYear)}

                    </p>


                    <h1>
                        Learn with <span>understanding.</span>
                    </h1>


                    <p class="welcome-description">

                        Study the complete chapter sequence or explore
                        Mathematics through its subject areas.

                    </p>


                    <div class="learn-overview-stats">

                        <div>

                            <strong>
                                ${chapters.length}
                            </strong>

                            <span>
                                Chapters
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${exploredCount}
                            </strong>

                            <span>
                                Explored
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${curriculum.subjectAreas.length}
                            </strong>

                            <span>
                                Subject Areas
                            </span>

                        </div>

                    </div>

                </section>


                <section class="learn-library">

                    ${renderNavigation()}

                    ${contentHTML}

                </section>


            </div>

        `;

    }


    // ==========================================
    // INDIVIDUAL CHAPTER PAGE
    // ==========================================

    function renderChapter(container, chapter) {

        const subjectName = getSubjectName(chapter);


        const tags = Array.isArray(chapter.additionalTags)
            ? chapter.additionalTags
            : [];


        const tagHTML = tags.length

            ? `

                <p class="learn-source-note">

                    Also connected to:
                    ${tags.map(escapeHTML).join(", ")}

                </p>

            `

            : "";


        container.innerHTML = `

            <div class="learn-page">


                <button
                    class="learn-back-button"
                    type="button"
                    data-learn-back>

                    ← Back to
                    ${selectedSubjectId ? "subject chapters" : "all chapters"}

                </button>


                <section class="learn-chapter-hero">


                    <p class="eyebrow">

                        CHAPTER
                        ${escapeHTML(chapter.number)}
                        · CLASS IX

                    </p>


                    <h1>
                        ${escapeHTML(chapter.name)}
                    </h1>


                    <p class="welcome-description">

                        ${escapeHTML(subjectName)}

                    </p>


                    ${tagHTML}


                </section>


                <section class="learn-content-panel">


                    <div class="learn-section-heading">

                        <div>

                            <p class="panel-kicker">
                                CHAPTER OVERVIEW
                            </p>

                            <h2>
                                Lesson content is being prepared
                            </h2>

                        </div>

                    </div>


                    <p>

                        The chapter title and subject classification
                        are ready. Detailed syllabus subtopics,
                        explanations, diagrams, worked examples,
                        and practice questions have not yet been added.

                        They will be added from verified course
                        material rather than guessed.

                    </p>


                </section>


                <section class="learn-roadmap-panel">


                    <p class="panel-kicker">
                        LEARNING ROADMAP
                    </p>


                    <h2>
                        What this chapter will include
                    </h2>


                    <p>

                        The planned lesson structure will include
                        clear explanations, useful diagrams,
                        worked examples, and short understanding
                        checks once the chapter content has been prepared.

                    </p>


                    <div class="learn-roadmap-steps">

                        <span>01 · Understand</span>

                        <span>02 · Explore examples</span>

                        <span>03 · Check understanding</span>

                    </div>


                </section>


            </div>

        `;

    }


    // ==========================================
    // MAIN RENDER FUNCTION
    // ==========================================

    function render(container, stats) {

        if (
            !curriculum ||
            !Array.isArray(curriculum.chapters) ||
            !Array.isArray(curriculum.subjectAreas)
        ) {

            container.textContent =
                "MathLab curriculum data could not be loaded. " +
                "Check that class9-curriculum.js loads before learn.js.";

            return;

        }


        const chapter = selectedChapterId
            ? findChapter(selectedChapterId)
            : null;


        if (chapter) {

            renderChapter(container, chapter);

        } else {

            renderLibrary(container, stats || {});

        }

    }


    // ==========================================
    // CLICK EVENTS
    // ==========================================

    document.addEventListener("click", function (event) {

        const target = event.target;


        if (!target || typeof target.closest !== "function") {
            return;
        }


        // OPEN A CHAPTER
        const chapterButton = target.closest("[data-learn-chapter]");


        if (chapterButton) {

            const chapter = findChapter(
                chapterButton.dataset.learnChapter
            );


            if (!chapter) {
                return;
            }


            selectedChapterId = chapter.id;


            const context = window.MathLabAppContext;


            // Preserve existing progress tracking.
            if (context && context.stats) {

                context.stats.lastTopic = chapter.name;


                if (!Array.isArray(context.stats.topicsOpened)) {

                    context.stats.topicsOpened = [];

                }


                if (!context.stats.topicsOpened.includes(chapter.name)) {

                    context.stats.topicsOpened.push(chapter.name);

                }


                if (typeof context.recordActivity === "function") {

                    context.recordActivity(

                        "Opened " + chapter.name,

                        "Viewed the chapter overview and learning roadmap."

                    );

                }

            }


            const main = document.getElementById("main-content");


            if (main) {

                render(

                    main,

                    context && context.stats ? context.stats : {}

                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            return;

        }


        // OPEN A SUBJECT
        const subjectButton = target.closest("[data-learn-subject]");


        if (subjectButton) {

            selectedChapterId = "";

            selectedSubjectId = subjectButton.dataset.learnSubject;

            activeView = "subjects";


            const main = document.getElementById("main-content");

            const context = window.MathLabAppContext;


            if (main) {

                render(

                    main,

                    context && context.stats ? context.stats : {}

                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            return;

        }


        // SWITCH BETWEEN ALL CHAPTERS AND SUBJECTS
        const viewButton = target.closest("[data-learn-view]");


        if (viewButton) {

            selectedChapterId = "";

            selectedSubjectId = "";

            activeView =
                viewButton.dataset.learnView === "subjects"
                    ? "subjects"
                    : "chapters";


            const main = document.getElementById("main-content");

            const context = window.MathLabAppContext;


            if (main) {

                render(

                    main,

                    context && context.stats ? context.stats : {}

                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            return;

        }


        // RETURN TO SUBJECT LIBRARY
        if (target.closest("[data-learn-subject-back]")) {

            selectedChapterId = "";

            selectedSubjectId = "";

            activeView = "subjects";


            const main = document.getElementById("main-content");

            const context = window.MathLabAppContext;


            if (main) {

                render(

                    main,

                    context && context.stats ? context.stats : {}

                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


            return;

        }


        // RETURN FROM A CHAPTER
        if (target.closest("[data-learn-back]")) {

            selectedChapterId = "";


            const main = document.getElementById("main-content");

            const context = window.MathLabAppContext;


            if (main) {

                render(

                    main,

                    context && context.stats ? context.stats : {}

                );

            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    });


    // ==========================================
    // CONNECT WITH MATHLAB APP
    // ==========================================

    window.MathLabLearn = {
        render: render
    };


}());
