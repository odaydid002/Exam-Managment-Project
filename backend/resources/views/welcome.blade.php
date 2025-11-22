<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
    <link rel="shortcut icon" href="/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="UniTime" />
    <link rel="manifest" href="/favicon/site.webmanifest" />
    <link rel="stylesheet" href="/styles/style.css">
    <title>Unitime Server</title>
</head>
<body>
    <div class="header">
        <div class="logo-title">
            <svg class="logo" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 400 400">
                <rect class="st3" x="98.31" y="204.03" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect class="st3" x="156.96" y="204.03" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect class="st3" x="98.31" y="261.4" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <rect class="st3" x="156.96" y="261.4" width="37.83" height="35.14" rx="4.6" ry="4.6"/>
                <path class="st3" d="M297.67,99.49l-16.14,6.9v39.4c4.15,1.77,7.07,5.9,7.07,10.7,0,2.98-1.11,5.7-2.99,7.76l6.74,20.36c.56,1.68-.71,3.41-2.47,3.41h-25.73c-1.81,0-3.09-1.74-2.53-3.47l6.53-20.51c-1.74-2.04-2.79-4.66-2.79-7.55,0-4.61,2.69-8.6,6.58-10.46v-35.53l-80.77,34.53c-4.66,1.37-8.61,1.42-11.05.57l-109.61-45.49c-5.76-3.32-6.87-8.58-1.11-11.92l107.32-43.6c2.67-1.54,10.16-1.65,12.84-.11l107.61,43.85c5.77,3.32,4.58,8.41.52,11.16Z"/>
                <path class="st2" d="M376.64,185.56l.02.02-87.3,94.38s-7.9,10.82-17.49,10.82c-10.4,0-17.18-10.82-17.18-10.82l-34.22-37.69h.02v-.02c-2.93-2.93-4.74-6.99-4.74-11.45,0-8.95,7.25-16.21,16.21-16.21,5.16,0,9.75,2.41,12.73,6.16,8.77,9.69,17.52,19.37,26.28,29.06l81.83-86.43.12.11c2.95-3.18,7.16-5.16,11.84-5.16,8.95,0,16.21,7.25,16.21,16.21,0,4.26-1.65,8.12-4.34,11.02Z"/>
                <path class="st3" d="M189.53,154.33c-3.74,1.56-7.96,1.56-11.71,0l-66.51-27.61.15,22.43h-30.76c-16.72,0-30.33,13.6-30.33,30.33v140.41c0,16.75,13.58,30.33,30.33,30.33h228.17c16.73,0,30.33-13.61,30.33-30.33v-70.47l-20.06,20.62v49.84c0,5.65-4.6,10.26-10.26,10.26H80.7c-5.65,0-10.26-4.62-10.26-10.26v-140.41c0-5.66,4.61-10.26,10.26-10.26h53.62v-.17h19.94l-.37.15,101.67-.17.22-42.24"/>
                <path class="st0" d="M181.62,156.16"/>
                <path class="st1" d="M563.21,72.23"/>
            </svg>
            <p class="title">Unitime - Server</p>
        </div>
        <h1 class="head-title">APIs Documentation</h1>
        <p class="head-description">Complete reference for all available API endpoints</p>
    </div>
   <div class="main-container" id="mainContainer">
    <!--
    <div class="api">
        <div class="api-head">
            <h3 class="target">Auth</h3>
            <p class="api-description">Authentification related APIs</p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="chevron">
                <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z"/>
            </svg>
        </div>
        <div class="endpoints">
            <div class="endpoint">
                <div class="endpoint-head">
                    <div class="flex-row">
                        <div class="methode m-post">
                            <p>POST</p>
                        </div>
                        <p class="route">/auth/signup</p>
                    </div>
                    <p class="endpoint-title">Register new user</p>
                    <div class="flex-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="lock">
                            <path d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="chevron">
                            <path d="M297.4 169.4C309.9 156.9 330.2 156.9 342.7 169.4L534.7 361.4C547.2 373.9 547.2 394.2 534.7 406.7C522.2 419.2 501.9 419.2 489.4 406.7L320 237.3L150.6 406.6C138.1 419.1 117.8 419.1 105.3 406.6C92.8 394.1 92.8 373.8 105.3 361.3L297.3 169.3z"/>
                        </svg>
                    </div>
                </div>
                <div class="endpoint-body">
                    <h3 class="endpoint-detail">Endpoint details</h3>
                    <p class="detailed-text">Generate new access token using refresh token</p>
                    <div class="flex-row">
                        <p class="detailed-text">Method: <span class="text">GET</span></p>
                        <p class="detailed-text center">Authentification: <span class="text">Required</span></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    -->
   </div>
   <script src="/js/app.js"></script>
</body>
</html>