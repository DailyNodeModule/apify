const Apify = require('apify');

var results = [];

// This points to the directory that be used as a working directory for the crawler.
process.env.APIFY_LOCAL_STORAGE_DIR = "apify_storage";

(async () => {
    // Multiple queues can be created and attached to different crawlers.
    // For example, this can be used to create one crawler for links on a search result page, and a seperate crawler for scraping the pages.
    const requestQueue = await Apify.openRequestQueue("queue");
    
    // Adds the root url (which lists all emperors) which will be scraped for child pages (the individual emperors).
    requestQueue.addRequest({ url: 'https://en.wikipedia.org/wiki/Book:Holy_Roman_Emperors' });

    const crawler = new Apify.CheerioCrawler({
        // Various settings that can be tweaked.
        requestQueue,
        minConcurrency: 1,
        maxConcurrency: 10,
        maxRequestRetries: 3,
        handlePageTimeoutSecs: 15,
        handlePageFunction: async ({ request, html, $ }) => {
            // Here we differentiate between the root page, and the child pages.
            
            // This block handles the root page, which is identified by its title.
            if ($('title').text() === 'Book:Holy Roman Emperors - Wikipedia') {
                // This grabs links under the section titled "Holy Roman Emperors".
                const links = $('a', $('dt:contains("Holy Roman Emperors")').nextAll('dd')).get();

                for (const linkElement of links) {
                    // The "href" attribute of each "a" element is fed back into the crawler.
                    const link = $(linkElement).attr('href');
                    
                    console.log(`Adding link ${link}`);
                    requestQueue.addRequest({ url: `https://en.wikipedia.org`+link });
                }
            } 
            // The child page is identified by the offical title of the article subject on the right sidebar.
            else if ($('tr th a[title="Holy Roman Emperor"]').length > 0){
                console.log("Scraping "+request.url);
                // The name, image-url, and reign start and end dates are pulled from the sidebar and pushed into an array.
                const name = $('.infobox.vcard th').first().text();
                const image = 'https:'+$('.infobox.vcard img').first().attr('src');
                const reign = $('th:contains("Reign")', $('tr th a[title="Holy Roman Emperor"]').parents('tr').next()).next().text().split('–');
                let reignStart, reignEnd;
                if (reign[0] && reign[1]) {
                    reignStart = Number(reign[0].trim().split(" ").pop());
                    reignEnd = Number(reign[1].trim().split(" ").pop());
                    results.push({ name, image, reignStart, reignEnd, link: request.url });
                }
            }
        },
        handleFailedRequestFunction: async ({ request }) => {
            
        }
    });

    await crawler.run();
    // Upon completion the results are sorted by their reign start date.
    results = results.sort((a, b) => a.reignStart - b.reignStart);
})();

require("./webServer")(results);