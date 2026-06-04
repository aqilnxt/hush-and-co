<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hush & Co.</title>
  <link rel="icon" href="{{ asset('favicon_io/favicon-32x32.png') }}" type="image/png">
  <link rel="shortcut icon" href="{{ asset('favicon_io/favicon.ico') }}">
  <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicon_io/apple-touch-icon.png') }}">
  <link rel="manifest" href="{{ asset('favicon_io/site.webmanifest') }}">
  <meta name="theme-color" content="#1B2A4A">
  @viteReactRefresh
  @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>

<body>
  <div id="app"></div>
</body>

</html>