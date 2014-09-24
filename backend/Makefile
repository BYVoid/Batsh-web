all: batsh_srv.native

debug: batsh_srv.byte

batsh_srv.%: batsh_srv.ml
	corebuild -pkgs async,yojson,batsh-lib $@

test: batsh_srv.byte
	./batsh_srv.byte

clean:
	rm -rf _build batsh_srv.native batsh_srv.byte
