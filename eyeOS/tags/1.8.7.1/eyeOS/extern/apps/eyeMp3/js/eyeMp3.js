/*jslint */
/*
                                  ____   _____
                                 / __ \ / ____|
                  ___ _   _  ___| |  | | (___
                 / _ \ | | |/ _ \ |  | |\___ \
                |  __/ |_| |  __/ |__| |____) |
                 \___|\__, |\___|\____/|_____/
                       __/ |
                      |___/              1.8

                     Web Operating System
                           eyeOS.org

             eyeOS Engineering Team - www.eyeos.org/team

     eyeOS is released under the GNU Affero General Public License Version 3 (AGPL3)
            provided with this release in license.txt
             or via web at gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeOS Team (team@eyeos.org)
*/

function eyeMp3_loadSound(myPid, path, title) {
	var e = document.getElementById(myPid + '_eyeMp3_Flash');
	e.SetVariable('jsValue', path);
	e.SetVariable('jsMethod', 'newfile');
	Windws.setTitle(myPid + '_eyeMp3_Window', title);
}