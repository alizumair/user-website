import { UtilityService } from './../utility/utility.service';
import { Injectable, Inject } from '@angular/core';
import { WINDOW } from '../window/window.service';
import { ScriptModel } from '../../shared/models/script.model';
import { DOCUMENT } from '@angular/common';

declare var document: any;

@Injectable({
    providedIn: 'root'
})
export class ToolScriptService {

    constructor(
        private util: UtilityService,
        @Inject(WINDOW) private window: Window,
        @Inject(DOCUMENT) private document
    ) { }

    loadScript(script: ScriptModel): Promise<ScriptModel> {
        return new Promise((resolve, reject) => {
            //resolve if already loaded

            if (this.document.getElementById(script.id)) {
                script.isLoaded = true;
                return resolve(script);
            } else {
                //load script
                let scriptElement = document.createElement('script');
                scriptElement.id = script.id;
                scriptElement.type = 'text/javascript';
                scriptElement.text = script.text;
                if (scriptElement.readyState) {  //IE
                    scriptElement.onreadystatechange = () => {
                        if (scriptElement.readyState === "loaded" || scriptElement.readyState === "complete") {
                            scriptElement.onreadystatechange = null;
                            script.isLoaded = true;
                            return resolve(script);
                        }
                    };
                } else {  //Others
                    scriptElement.onload = () => {
                        script.isLoaded = true;
                        return resolve(script);
                    };
                }
                scriptElement.onerror = (error: any) => resolve(script);
                document.getElementsByTagName('head')[0].appendChild(scriptElement);
            }
        });
    }
}