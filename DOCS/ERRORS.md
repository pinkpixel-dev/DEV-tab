# Errors

Failed approaches and difficult bugs that are worth remembering.

Log a failure when it took more than two attempts, the root cause was somewhere other than the symptom, the behavior is environment-specific and will recur, or a reasonable next approach would fail the same way. This is not a bug tracker. Ordinary bugs found and fixed quickly do not belong here.

## 2026-10-11

### Note: DEV ignores the `tags` and `tags_exclude` params even though the spec lists them

What did not work: `GET /api/articles?tags=rust,go` and `?tags_exclude=ai,webdev`, alone or with `top=7` or `state=rising`. DEV returned the normal unfiltered feed every time, with no error.

What worked instead: The singular `tag` param filters correctly, including with `top`, `state` and on `/articles/latest`. Hidden tags are filtered client-side with `hideTagged` in `lib/api/articles.ts`. Multi-tag feeds need one request per tag.

Note for next time: Check a filter param against live dev.to responses before building on it, because the OpenAPI spec isn't reliable for this.
