import traceback
from flask import Flask, request, Response
import sys
from .segmenter import Segmenter

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False

segmenter = Segmenter()

#
# routes
#


@app.route("/segment", methods=["POST"])
def route_segment():
    source = request.get_data().decode("utf-8")
    print(f"{source = }, {request.form = }")
    segments = segmenter.run(source)
    details = segmenter.run_mecab(source)
    return dict(result=segments, details=details)


#
# middlewares
#


@app.errorhandler(Exception)
def handle_runtime_error(error: Exception):
    full_message = traceback.format_exc()
    print(full_message, file=sys.stderr)
    return (
        dict(
            type=error.__class__.__name__,
            message=str(error),
            full_message=full_message,
        ),
        400,
    )


@app.after_request
def handle_cors(response: Response) -> Response:
    response.headers.set("access-control-allow-origin", "*")
    response.headers.set("access-control-allow-methods", "GET")
    return response
