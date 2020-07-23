/*

>> kasperkamperman.com - 2018-04-18
>> https://www.kasperkamperman.com/blog/camera-template/

*/

var takeSnapshotUI = createClickFeedbackUI();

var video;
var takePhotoButton;
var toggleFullScreenButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentFacingMode = 'environment';

$(window).on('resize', function() {
    if (window.innerHeight > window.innerWidth) {
        var h = $('video').height();
        h = h - $('#gui_controls').height();
        $('#Styler').css('top', h  * 0.05 + "px");
        h = h * 0.9;
        $('#Styler').css('height', h + "px");
    } else {
        $('#Styler').css('top', $('video').height()  * 0.05 + "px");
        var h = $('video').height() * 0.9;
        $('#Styler').css('height', h + "px");
    }
});

document.addEventListener("DOMContentLoaded", function(event) {

    // do some WebRTC checks before creating the interface
    DetectRTC.load(function() {

        // do some checks
        if (DetectRTC.isWebRTCSupported == false) {
            alert('Please use Chrome, Firefox, iOS 11, Android 5 or higher, Safari 11 or higher');
        }
        else {
            if (DetectRTC.hasWebcam == false) {
                alert('Please install an external webcam device.');
            }
            else {

                amountOfCameras = DetectRTC.videoInputDevices.length;
                       
                initCameraUI();
                initCameraStream();
            } 
        }
        
        console.log("RTC Debug info: " + 
            "\n OS:                   " + DetectRTC.osName + " " + DetectRTC.osVersion + 
            "\n browser:              " + DetectRTC.browser.fullVersion + " " + DetectRTC.browser.name +
            "\n is Mobile Device:     " + DetectRTC.isMobileDevice +
            "\n has webcam:           " + DetectRTC.hasWebcam + 
            "\n has permission:       " + DetectRTC.isWebsiteHasWebcamPermission +       
            "\n getUserMedia Support: " + DetectRTC.isGetUserMediaSupported + 
            "\n isWebRTC Supported:   " + DetectRTC.isWebRTCSupported + 
            "\n WebAudio Supported:   " + DetectRTC.isAudioContextSupported +
            "\n is Mobile Device:     " + DetectRTC.isMobileDevice
        );

    });

});

function initCameraUI() {
    
    video = document.getElementById('video');

    takePhotoButton = document.getElementById('takePhotoButton');
    toggleFullScreenButton = document.getElementById('toggleFullScreenButton');
    toggleGenderButton = document.getElementById('toggleGenderButton');
    switchCameraButton = document.getElementById('switchCameraButton');
    
    // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

    takePhotoButton.addEventListener("click", function() {
        takeSnapshotUI();
        takeSnapshot();        
    });

    toggleGenderButton.addEventListener("click", function() {
        if (toggleGenderButton.getAttribute("aria-pressed") == "true") {
            toggleGenderButton.setAttribute("aria-pressed", "false");
            $('#Styler').css({"background":"url(img/img-woman-outline2.png) center no-repeat", "background-size":"contain"});
        } else {
            toggleGenderButton.setAttribute("aria-pressed", "true");
            $('#Styler').css({"background":"url(img/img-man-outline2.png) center no-repeat", "background-size":"contain"});
        }
    });

    // -- fullscreen part

    // function fullScreenChange() {
    //     if(screenfull.isFullscreen) {
    //         toggleFullScreenButton.setAttribute("aria-pressed", true);
    //     }
    //     else {
    //         toggleFullScreenButton.setAttribute("aria-pressed", false);
    //     }
    // }

    // if (screenfull.enabled) {
    //     screenfull.on('change', fullScreenChange);

    //     toggleFullScreenButton.style.display = 'block';  

    //     // set init values
    //     fullScreenChange();

    //     toggleFullScreenButton.addEventListener("click", function() {
    //         screenfull.toggle(document.getElementById('container')).then(function () {
 	// 				console.log('Fullscreen mode: ' + (screenfull.isFullscreen ? 'enabled' : 'disabled'))
 	// 		});
    //     });
    // }
    // else {
    //     console.log("iOS doesn't support fullscreen (yet)");   
    // }
        
    // -- switch camera part
    if(amountOfCameras > 1) {
        
        switchCameraButton.style.display = 'block';
        
        switchCameraButton.addEventListener("click", function() {

            if(currentFacingMode === 'environment') currentFacingMode = 'user';
            else                                    currentFacingMode = 'environment';

            initCameraStream();

        });  
    }

    // Listen for orientation changes to make sure buttons stay at the side of the 
    // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
    // https://www.sitepoint.com/introducing-screen-orientation-api/
    // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
    window.addEventListener("orientationchange", function() {
        
        // iOS doesn't have screen.orientation, so fallback to window.orientation.
        // screen.orientation will 
        if(screen.orientation) angle = screen.orientation.angle;
        else                   angle = window.orientation;

        var guiControls = document.getElementById("gui_controls").classList;
        var vidContainer = document.getElementById("vid_container").classList;

        if(angle == 270 || angle == -90) {
            guiControls.add('left');
            vidContainer.add('left');
        }
        else {
            if ( guiControls.contains('left') ) guiControls.remove('left');
            if ( vidContainer.contains('left') ) vidContainer.remove('left');
        }

        //0   portrait-primary   
        //180 portrait-secondary device is down under
        //90  landscape-primary  buttons at the right
        //270 landscape-secondary buttons at the left
    }, false);
    
}

// https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function initCameraStream() {

    // stop any active streams in the window
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    var constraints = { 
        audio: false, 
        video: {
            //width: { min: 1024, ideal: window.innerWidth, max: 1920 },
            //height: { min: 776, ideal: window.innerHeight, max: 1080 },
            facingMode: currentFacingMode
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);   

    function handleSuccess(stream) {

        window.stream = stream; // make stream available to browser console
        video.srcObject = stream;

        if(constraints.video.facingMode) {

            if(constraints.video.facingMode === 'environment') {
                switchCameraButton.setAttribute("aria-pressed", true);
            }
            else {
                switchCameraButton.setAttribute("aria-pressed", false);
            }
        }

        console.log("Camera Stream Width: " + $('video').width() + " Camera Stream Height: " + $('video').height());


        if (window.innerHeight > window.innerWidth) {
            var h = $('video').height();
            h = h - $('#gui_controls').height();
            $('#Styler').css('top', h  * 0.05 + "px");
            h = h * 0.9;
            $('#Styler').css('height', h + "px");
        } else {
            $('#Styler').css('top', $('video').height()  * 0.05 + "px");
            var h = $('video').height() * 0.9;
            $('#Styler').css('height', h + "px");
        }

        return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {

        console.log(error);

        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if(error === 'PermissionDeniedError') {
            alert("Permission denied. Please refresh and give permission.");
        }
        
    }

}

function takeSnapshot() {
    
    // if you'd like to show the canvas add it to the DOM
    var canvas = document.createElement('canvas');

    var width = video.videoWidth;
    var height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    // polyfil if needed https://github.com/blueimp/JavaScript-Canvas-to-Blob
    
    // https://developers.google.com/web/fundamentals/primers/promises
    // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
    function getCanvasBlob(canvas) {
        return new Promise(function(resolve, reject) {
            canvas.toBlob(function(blob) { resolve(blob) }, 'image/jpeg');
        })
    }

    // some API's (like Azure Custom Vision) need a blob with image data
    getCanvasBlob(canvas).then(function(blob) {

        // do something with the image blob
        var reader = new FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
            base64data = reader.result;                
            console.log(base64data);
            var clothes = undefined;
	
            const M_RAW_WIDTH = 625;
            const M_RAW_HEIGHT = 1801;
            
            const M_M_RAW_NECK_POS_Y = 343;
            const M_M_RAW_BUTTOCKS_POS_Y = 844;
            const M_M_RAW_BUTTOCKS_WIDTH = 345;
            
            const W_M_RAW_NECK_POS_Y = 358;
            const W_M_RAW_BUTTOCKS_POS_Y = 846;
            const W_M_RAW_BUTTOCKS_WIDTH = 343;
    
            const requestUrl = "https://api-us.faceplusplus.com/humanbodypp/v1/skeleton";
			const api_key = "uB2kzuZxWPqvDrKRHSBXoebQzGLX4li4";
			const api_secret = "2pdMDm45Bf-cmi7ae-mlKWBiaQf8LB79";
			const formData = {
				'api_key': api_key, 
				'api_secret': api_secret, 
				'image_base64': base64data
			}

			var bodySkeletonData = null;
			var clothesIndex = 0;

			$.post(requestUrl, formData, function(data, status) {
				console.log(`${data} and status is ${status}`);
				if (data != null && status == 'success') {
					bodySkeletonData = data;
					if (bodySkeletonData.skeletons.length == 0) {
                        console.log("Failed to detect person.");
                        launch_toast();
                        setTimeout(function(){ $('#toast').find('#desc').text('Failed to detect person'); }, 900);
						return false;
					}

					$.getJSON("<?php echo $data['config']['SITE_DIR']; ?>/lib/membermodelphoto/data/clothes.json", function(json) {
						
						clothes = json;
						
						if (clothes != undefined || clothes != "") {
						    
						    var markerScaleFactor;
							var clothesTop;
							var clothesWidth;
							var clothesHeight;
							var clothesLeft;
						    
						    if (clothes[clothesIndex].is_top == true) {
    							
    							if (clothes[clothesIndex].man_clothes == true) {
    							    markerScaleFactor = $('#Styler').height() / M_RAW_HEIGHT;
    							    clothesTop = M_M_RAW_NECK_POS_Y * markerScaleFactor + $('#WebCam').height() / 20;
    							} else {
    							    markerScaleFactor = $('#Styler').height() / M_RAW_HEIGHT;
    							    clothesTop = W_M_RAW_NECK_POS_Y * markerScaleFactor + $('#WebCam').height() / 20;
    							}
    							
                                clothesWidth = M_RAW_WIDTH * markerScaleFactor;
                                clothesLeft = ($('#WebCam').width() - clothesWidth) / 2;
						    
						    } else {
						        
    							if (clothes[clothesIndex].man_clothes == true) {
    							    markerScaleFactor = $('#Styler').height() / M_RAW_HEIGHT;
    							    clothesTop = M_M_RAW_BUTTOCKS_POS_Y * markerScaleFactor + $('#WebCam').height() / 20;
    							    clothesWidth = M_M_RAW_BUTTOCKS_WIDTH * markerScaleFactor;
    							} else {
    							    markerScaleFactor = $('#Styler').height() / M_RAW_HEIGHT;
    							    clothesTop = W_M_RAW_BUTTOCKS_POS_Y * markerScaleFactor + $('#WebCam').height() / 20;
    							    clothesWidth = W_M_RAW_BUTTOCKS_WIDTH * markerScaleFactor;
    							}
    							
    				            clothesLeft = ($('#WebCam').width() - clothesWidth) / 2;
						        
						    }

							var url = "<?php echo $data['config']['SITE_DIR']; ?>/lib/membermodelphoto/clothes/" + clothes[clothesIndex].source_front;

							$.redirect( "<?php echo $data['config']['SITE_DIR_LINK']; ?>/main/membermodelphoto/result", {
								'image_base64': base64data, 
								'source_width': $('#WebCam').width(), 
								'source_height': $('#WebCam').height(), 
								'clothes_top': clothesTop, 
								'clothes_left': clothesLeft, 
								'clothes_width': clothesWidth, 
								'clothes_source': url
							});
						}
					});
				}
			});
        }
    });

}

// https://hackernoon.com/how-to-use-javascript-closures-with-confidence-85cd1f841a6b
// closure; store this in a variable and call the variable as function
// eg. var takeSnapshotUI = createClickFeedbackUI();
// takeSnapshotUI();

function createClickFeedbackUI() {

    // in order to give feedback that we actually pressed a button. 
    // we trigger a almost black overlay
    var overlay = document.getElementById("video_overlay");//.style.display;

    // sound feedback
    var sndClick = new Howl({ src: ['snd/click.mp3'] });

    var overlayVisibility = false;
    var timeOut = 80;

    function setFalseAgain() {
        overlayVisibility = false;	
        // overlay.style.display = 'none';
    }

    return function() {

        if(overlayVisibility == false) {
            sndClick.play();
            overlayVisibility = true;
            overlay.style.display = 'block';
            setTimeout(setFalseAgain, timeOut);
        }   

    }
}

function launch_toast() {
    var x = document.getElementById("toast")
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}