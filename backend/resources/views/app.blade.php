<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OOS Monitor</title>
</head>
<body>
    <div id="root"></div>
    @if (file_exists(public_path('index.html')))
        {!! file_get_contents(public_path('index.html')) !!}
    @else
        <script>
            window.location.href = 'http://localhost:5173' + window.location.pathname + window.location.search;
        </script>
    @endif
</body>
</html>
