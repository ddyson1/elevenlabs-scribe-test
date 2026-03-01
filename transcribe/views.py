import json
import os
import urllib.request
import urllib.error

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def index(request):
    return render(request, "transcribe/index.html")


@csrf_exempt
@require_POST
def scribe_token(request):
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return JsonResponse({"error": "ELEVENLABS_API_KEY is not configured"}, status=500)

    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/single-use-token/realtime_scribe",
        data=b"",
        headers={
            "xi-api-key": api_key,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            return JsonResponse(data)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return JsonResponse({"error": f"ElevenLabs API error: {error_body}"}, status=e.code)
