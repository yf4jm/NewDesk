import React from 'react'
import openApp from '../openApp';
const actionsFactory = (actionName,fields={},option) => {
    console.log('actionName:', actionName);
    
    if(!actionName) {
        throw new Error("Action name is required");
    }else if(actionName ==='OnClick'){
        if(option === 'openApp') {
        openApp(fields.appName, `/apps/${fields.appName}`, fields.windowOptions || {});
    }
    }else if(actionName === 'OnHover') {
        // Handle OnHover action
        // console.log('OnHover action triggered with fields:', fields);
    }else if (actionName === 'OnKeyPress') {
        
        
        if (option === 'move') {
            const { direction, tileKey } = fields;
            console.log(`Moving in direction: ${direction}, Tile Key: ${tileKey}`);
            
            return { direction, tileKey }; // Return movement data
        }
    }
}

export default actionsFactory