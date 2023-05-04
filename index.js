const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: false,
        });
        const page = await browser.newPage();
        await page.goto('https://trello.com/b/QvHVksDa/personal-work-goals');
        await page.waitForTimeout(2500);
    
        const sTableName = await page.evaluate( () => {
            return document.querySelector('div.board-main-content h1').innerText;
        });

        const aCards = await page.evaluate( () => {
            const elements = document.querySelectorAll('#board div.js-list');
            const board = [];

            for (let element of elements) {
                const aLinks = element.querySelectorAll('a.list-card');
                const oTmpCard = {};

                oTmpCard.title = element.querySelector('h2').innerText;
                oTmpCard.links = [];

                for (let link of aLinks) {
                    oTmpCard.links.push(link.href);
                }

                board.push(oTmpCard);
            }

            return board;
        });

        for (let oCard of aCards) {
            oCard.aTask = [];

            for (let link of oCard.links) {
                await page.goto(link);
                // await page.waitForSelector('.card-detail-window div.attachment-thumbnail');
                await page.waitForTimeout(5000);
                
                oCard.aTask.push( await page.evaluate( () => {
                    const oBody = {};
                    oBody.aChekList = [];
                    oBody.aAttachments = [];

                    oBody.header = document.querySelector('.card-detail-window h2').innerText;
                    (document.querySelector('.card-detail-window div.R2ALs3T3MmBZVl') !== null) ? oBody.priority = document.querySelector('.card-detail-window div.R2ALs3T3MmBZVl').getAttribute('data-color') :  oBody.priority = '';
                    (document.querySelector('.card-detail-window div.description-content p') !== null) ? oBody.description = document.querySelector('.card-detail-window div.description-content p').innerText : oBody.description = '';
                    
                    if(document.querySelector('.card-detail-window div.attachment-thumbnail') !== null) {
                        const attachments = document.querySelectorAll('.card-detail-window div.attachment-thumbnail');

                        for (let attachment of attachments) {
                            const oAttBody = {};
                            oAttBody.title = attachment.querySelector('a').getAttribute('title');
                            oAttBody.link = attachment.querySelector('a').href;
                            oBody.aAttachments.push(oAttBody);
                        }
                    }

                    if(document.querySelector('.checklist') !== null) {
                        const checkboxes = document.querySelectorAll('.checklist-item');
                        oBody.listTitle = document.querySelector('.checklist h3').innerText;

                        for (let checkbox of checkboxes) {
                            const oCheckBody = {};
                            (checkbox.getAttribute('class').includes('complete')) ? oCheckBody.checked = true : oCheckBody.checked = false;
                            oCheckBody.label = checkbox.querySelector('span.checklist-item-details-text').innerText;
                            oBody.aChekList.push(oCheckBody);
                        }
                    }

                    return oBody;
                }));   
            }
            
        }
        
        await page.goto('https://todoist.com/es');
        await page.waitForTimeout(1000);

        await page.click('div.IntroSection_heroCopy__VWOHk a.Z2j5FoeQ_umI7vX0SmxF');
        await page.waitForTimeout(1000);

        await page.click('div.f973eed0 a');
        await page.waitForTimeout(2000);

        await page.type('#element-6', 'isay1005@hotmail.com');
        await page.type('#element-9', '3=Ve68sj^23md.F');
        await page.click('form._2a3b75a1 button.nFxHGeI');
        await page.waitForTimeout(15000);


        await page.waitForSelector('button[aria-label="Añadir proyecto"]');
        await page.click('button[aria-label="Añadir proyecto"]');
        await page.waitForTimeout(1500);

        // await page.type('#edit_project_modal_field_name', 'Testing');
        await page.type('#edit_project_modal_field_name', sTableName);
        await page.waitForTimeout(500);

        await page.click('#project_list_board_style_option');
        await page.waitForTimeout(500);

        await page.click('button[type="submit"]');
        await page.waitForTimeout(500);

        await page.click('button.cancel_link');
        await page.waitForTimeout(500);
        
        for (let card of aCards) {
            let i = 0;

            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            await page.waitForSelector('button.board_add_section_button');
            await page.click('button.board_add_section_button');
            await page.waitForTimeout(500);

            await page.type('input.name', card.title);
            await page.waitForTimeout(500);

            await page.click('button[type="submit"]');
            await page.waitForTimeout(500);

            for(let task of card.aTask) {
                let nameSection = 'section[aria-label="'+ card.title +'"]';
                let formSection = await page.$(nameSection + ' form.task_editor');

                if(!formSection) {
                    await page.waitForSelector(nameSection + ' button[aria-label="Añadir tarea a '+ card.title +'"]');
                    await page.click(nameSection + ' button[aria-label="Añadir tarea a '+ card.title +'"]');
                    await page.waitForTimeout(500);
                }
            
                await page.type(nameSection + ' div[aria-label="Nombre de la tarea"]', task.header);
                await page.waitForTimeout(500);

                let sDescription = "Descripción: \n" + task.description + "\n";

                if(task.aAttachments.length !== 0) {
                    sDescription = sDescription + "Adjuntos: \n";
        
                    for (let attachment of task.aAttachments) {
                        sDescription = sDescription + attachment.title + "\n"
                        sDescription = sDescription + attachment.link + "\n"
                    }
                }
        
                if(task.aChekList.length !== 0) {
                    sDescription = sDescription + task.listTitle +": \n";
        
                    for (let checkbox of task.aChekList) {
                        if(checkbox.checked) {
                            sDescription = sDescription + "[Completado] ";
                        } else {
                            sDescription = sDescription + "[Faltante] ";
                        }
        
                        sDescription = sDescription + checkbox.label + "\n";
                    }
                }

                await page.type(nameSection + ' div[aria-label="Descripción"]', sDescription);
                await page.waitForTimeout(500);

                await page.click(nameSection + ' div[aria-label="Establecer prioridad"]');
                await page.waitForTimeout(500);

                switch (task.priority) {
                    case 'green':
                        await page.click('li[data-action-hint="task-actions-priority-2"]');
                        break;
                    case 'yellow':
                        await page.click('li[data-action-hint="task-actions-priority-3"]');
                        break;
                    case 'red':
                        await page.click('li[data-action-hint="task-actions-priority-4"]');
                        break;
                    case '':
                        await page.keyboard.press('Enter');
                        break;
                };

                await page.waitForTimeout(1000);

                await page.click('button[type="submit"]');
                await page.waitForTimeout(1000);
            }       
        }    

        await page.waitForTimeout(1500);
        console.log('The script finished correctly!');
        await browser.close();
    }
    catch(err) {
        console.log("Error: " + err);
        process.exit(1);
    }
})();