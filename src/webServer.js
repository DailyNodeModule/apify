const express = require("express");

// Simple express app to display results

module.exports =  (results) => {
    const app = express();

    app.get("/", (req, res) => {
        res.set("content-type", 'text/html');
        res.end(
            `
                <h1>Holy Roman Emperors</h1>
            ` + 
            results.map((emperor) => {
                let reign = '';
                if (emperor.reignStart)
                    reign = ` <div>Reign: ${emperor.reignStart}-${emperor.reignEnd}</div>`;

                return `
                <p>
                    <h2><a href="${emperor.link}">${emperor.name}</a></h2>
                    <div>
                        <img src="${emperor.image}"/>
                    </div>
                    ${reign}
                </p>
            `;
            }).join("")
        )
    });

    const port = Number(process.env.PORT) || 3000;
    console.log(`Listening on ${port}`);

    app.listen(port);
};