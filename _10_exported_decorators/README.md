# This is a placeholder

THe membrane metadata decorators I provide have to be available without requiring the full es-membrane installation.  Ideally, they would be a separate package (`es-membrane-decorators`?), exporting only decorators and a truly readonly map instance (implementing `ReadonlyMap` type but not being a native `Map`) describing the various settings from those decorators.

The idea is that library developers could use _just_ the decorators, and `es-membrane` would import the static readonly map.

I'm not sure how this will work if the library is in a separate realm.
