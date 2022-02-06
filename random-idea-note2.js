; (() => {
    // init
    const button_id = "randomDailyNote"

    const button = document.getElementById(button_id)
    if (button) {
        console.log(button_id + ' already loaded')
        return
    }

    let dailyNoteIndex = 0,
        randomDailyNotesList = shuffleArray(userDailyNotesList())

    addButton()


    // functions
    function userDailyNotesList() {
        return window.roamAlphaAPI.q(`[:find (pull ?page [:block/uid :block/children]) :where [?page :node/title]]`)
            .filter(x => x[0].title.match(/^(🌱)/)) // removes pages that aren't daily notes (uid in format mm-dd-YYYY)
            .filter(x => x[0].children) // removes pages containing no children
            .filter(x => {
                if (x[0].children.length == 1) {
                    const child_id = x[0].children[0].id
                    const child_block = window.roamAlphaAPI.pull("[:block/children, :block/string]", child_id)

                    if (!child_block[':block/children'] && child_block[':block/string'] == '') {
                        return false
                    }
                }
                return true
            }) // removes pages with one child that is blank
            .map(x => x[0].uid) // returns only the dates
    }

    function shuffleArray(array) {
        const a = array.slice()

        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]]
        }

        return a
    }

    function addButton() {
        const topbar = document.querySelector('.rm-topbar')

        if (topbar) {
            const button = Object.assign(document.createElement('div'), {
                id: button_id,
                className: "bp3-button bp3-minimal bp3-small bp3-icon-random",
                title: `Random Daily Note (0/${randomDailyNotesList.length})`,
                style: "margin-left: 4px;",
                onclick() { openRandomDailyNote() }
            })

            topbar.appendChild(button)
            console.log(button_id + ' loaded')
        } else {
            // wait for Roam to finish loading
            setTimeout(addButton, 500)
        }
    }

    function openRandomDailyNote() {
        navigateToPage(randomDailyNotesList[dailyNoteIndex++])

        document.getElementById(button_id).title = `Random Daily Note (${dailyNoteIndex}/${randomDailyNotesList.length})` // update queue position in tooltip

        if (dailyNoteIndex == randomDailyNotesList.length) {
            dailyNoteIndex = 0
            randomDailyNotesList = shuffleArray(userDailyNotesList())
        }
    }

    function navigateToPage(page_title) {
        window.location.href = `https://roamresearch.com/#/app/${graphName()}/page/${page_title}`
    }

    function graphName() {
        const href_arr = window.location.href.split('/')
        return href_arr[href_arr.indexOf('app') + 1]
    }
})();
