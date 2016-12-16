/**    
To all informations see the README.MD in github.com/itscaiqueck

Tested in Photoshop CC.
**/
#target photoshop 

// Creates a new window dialog
var window = new Window ( "dialog", "Android Icons", undefined, { closeButton: true } );

// Defines some layout configurations
window.orientation = "column";
window.margins     = 15;
// Adds a static text
window.add ( "statictext", undefined, "Select your current icons dimensions:" );

// Creates a panel
var radioGroup = window.add ( "panel" );
// Defines some layout configurations
radioGroup.alignChildren = "left";
// Creates the radio buttons with the android dimensions
radioGroup.add ( "radiobutton", undefined, "xxxhdpi" );
radioGroup.add ( "radiobutton", undefined, "xxhdpi" );
radioGroup.add ( "radiobutton", undefined, "xhdpi" );
radioGroup.add ( "radiobutton", undefined, "hdpi" );

// Creates a button to select icons folder
var selectFolder  = window.add ( "button", undefined, "Select icons folder" );
selectFolder.size = [120,32];
// Creates a button to Cancel
var cancel  = window.add ( "button", undefined, "Cancel" );
cancel.size = [120,32];

// Sets the first radio button as selected
radioGroup.children[0].value = true;

// Returns the value for selected radio button
function selectedRadio ( radioButtons )
{
    var size = radioButtons.children.length;
    
    for ( var i = 0; i < size; i++ )
    {
        // Here is the importante part, we return i+1 because if current selected dimension is xxxhdpi, for exemple,
        // we gonna begin the script to work at the next dimension xxhdpi
        if ( radioButtons.children[i].value == true )
        { return i+1; }
    }
}

// Sets the click listener to begin the script
selectFolder.onClick = function () { begin ( radioGroup ); };
// Sets the click listenet to end the script
cancel.onClick = function () { return window.close(); };

// Shows the window
window.show();

// Here is the script machine, it will read all PNG files in a folder and resize all images
function begin ( radioButtons )
{     
    try
    {
        // Indicates there's no errors
        var error = 0;
        
        // Array with all android dimensions and their scales
        var dimens =
        [ 
            { "dimen": "xxxhdpi", "scale": 4 },
            { "dimen":  "xxhdpi", "scale": 3 },
            { "dimen":   "xhdpi", "scale": 2 },
            { "dimen":    "hdpi", "scale": 1.5 },
            { "dimen":    "mdpi", "scale": 1 }
        ];
        
        // Opens a dialog to be able to select a folder
        var input = Folder.selectDialog ( "Select a folder to continue..." );
        
        if ( input != null )
        {
            // Fixes the input folder path
            outputFolder = input+"/";
        
            // Sets where the adjusts will begin, if selected dimensions are xxxhdpi, the adjusts will begin at xxhdpi
            beginAt    = selectedRadio ( radioButtons );
            // Number of dimensions
            dimenCount = dimens.length;
            
            // Creates a new folder, if not exists, into input path for each dimension
            createFolders ( beginAt, dimens, outputFolder );
            
            // Gets all PNG files in the folder
            var files = input.getFiles ( "*.png" );
            // Number of files found
            var count = files.length;

            if ( count == 0 )
            { throw "There's no PNG files on folder..."; }        
            
            // Saves ruler units preferences
            var initialPrefs = app.preferences.rulerUnits;
            // Change ruler units to pixels
            app.preferences.rulerUnits = Units.PIXELS;
            
            // Creates the export option to save for web
            var saveIcons = new ExportOptionsSaveForWeb();
            
            // Sets the configurations for the export option
            saveIcons.format       = SaveDocumentType.PNG;
            saveIcons.PNG8         = false;
            saveIcons.transparency = true;
                    
            // For each file found...
            for ( var i = 0; i < count; i++ )
            {
                // Opens the file
                var icon = open ( files[i], OpenDocumentType.PNG );
                
                // If, for some reason, there's no file... so increases errors and continue to the next
                if ( icon == null )
                { 
                    error++;
                    continue;
                }
                
                // Deletes all meta data from image
                icon.info = null;
                
                // Gets the image name
                var name      = icon.name;
                // Gets the image width and height
                var width  = parseInt(icon.width);
                var height = parseInt(icon.height);
                
                // Adjusts image width and height to the base...
                // Base represents the normal scale, mdpi, and to discover it... we calculate!
                // For example, if your current dimensions is xxhdpi ( beginAt-1 ), then the base ( mdpi )
                // will be: dimension / 3 ( scale size from xxhdpi ).
                var baseWidth  = width / dimens[beginAt-1].scale;                
                var baseHeight = height / dimens[beginAt-1].scale;
                
                // Saves the history state of image
                var startedState = icon.activeHistoryState;
                
                // For each dimension...
                for ( var j = beginAt; j < dimenCount; j++ )
                {
                    // Gets the new width
                    tempWidth  = baseWidth * dimens[j].scale;
                    // Gets the new height
                    tempHeight = baseHeight * dimens[j].scale;
                    // Gets the output folder, that will be: (original folder)/(dimension)/
                    tempFile = outputFolder + dimens[j].dimen + "/" + name;
                    
                    // Defines a new image size
                    icon.resizeImage ( tempWidth, tempHeight, null, ResampleMethod.BICUBICSHARPER );
                    // Exports the image for web in a PNG file
                    icon.exportDocument ( new File ( tempFile ) , ExportType.SAVEFORWEB, saveIcons );
                    
                    // Recovers the image history to begin the cycle again
                    icon.activeHistoryState = startedState;
                }
                
                // Closes the image without save any changes
                icon.close ( SaveOptions.DONOTSAVECHANGES );
            }
        
            // Restores the user preferences to ruler units
            app.preferences.rulerUnits = initialPrefs;
            // Alerts user about the progress
            alert ( "All Android icons were created at: " + input + ". And it got " + error + " error(s)." );
            // Closes the script window
            window.close();
        }
        else
        { throw "You need to select a folder..."; }
          
    }
    catch (exception)
    {
        if ( ( exception != null ) && ( exception != "" ) )
        { alert( exception ); }
    }
}

// Creates a new folder, if not exists, into input path for each dimension
function createFolders ( beginAt, dimens, folder )
{
    dimenCount = dimens.length;
    
    for ( var i = beginAt; i < dimenCount; i++ )
    {
        var tempFolder = new Folder(folder+dimens[i].dimen);
        
        if ( !tempFolder.exists )
        { tempFolder.create(); }
    }
}