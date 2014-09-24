open Core_kernel.Std
open Async.Std
(* open Batsh *)

type request = {
  target : string;
  code : string;
}

let parse_request (str : string) : request =
  match Yojson.Basic.from_string str with
  | `Assoc fields ->
    let get_field name =
      match List.Assoc.find fields name with
      | Some value -> value
      | None ->
        failwith (
          "Cannot find field " ^ name
        )
    in
    let get_field_as_string name =
      match get_field name with
      | `String str -> str
      | _ ->
        failwith (
          "Value of field " ^ name ^ " must be a string"
        )
    in
    let target = get_field_as_string "target" in
    let code = get_field_as_string "code" in
    {target; code}
  | _ -> failwith "Top level of request must be an object"

let read_all (reader : Reader.t) : string Deferred.t =
  let rec read_buffer reader buffers : string Deferred.t =
    let buffer = String.create (4096) in
    Reader.read reader buffer
    >>= function
    | `Eof -> return (String.concat (List.rev buffers))
    | `Ok bytes_read ->
      read_buffer reader ((String.prefix buffer bytes_read) :: buffers)
  in
  read_buffer reader []

let compile (req : request) : string =
  match req.target with
  | "bash" ->
    let batsh = Parser.create_from_string req.code in
    let bash = Bash.compile batsh in
    Bash.print bash
  | "winbat" ->
    let batsh = Parser.create_from_string req.code in
    let batch = Winbat.compile batsh in
    Winbat.print batch
  | _ -> failwith ("Unknown target: " ^ req.target)

let make_response (code : string) =
  let json = `Assoc [
      ("code", `String code)
    ]
  in
  Yojson.Basic.to_string json

let make_error_response (err : string) =
  let json = `Assoc [
      ("err", `String err)
    ]
  in
  Yojson.Basic.to_string json

let handle_request (reader : Reader.t) (writer : Writer.t) =
  read_all reader >>= fun result ->
  let response =
    try
      let req = parse_request result in
      let code = compile req in
      make_response code
    with
    | Failure msg | Parser.ParseError msg | Parser.SemanticError msg
    | Yojson.Json_error msg ->
      make_error_response msg
    | Errors.SemanticError (msg, context) ->
      make_error_response (msg ^ "\n" ^ context)
  in
  Writer.write writer response;
  Writer.flushed writer
  >>= fun () ->
  return ()

let run_server ~port =
  ignore (
    Tcp.Server.create
      ~on_handler_error:(`Call (fun _addr e ->
          let msg = Exn.to_string e in
          eprintf "%s\n" msg
        ))
      (Tcp.on_port port)
      (fun _addr reader writer ->
         handle_request reader writer)
  );
  printf "Server started at port %d\n" port;
  Deferred.never ()

let () =
  Command.async_basic
    ~summary:"Server for Batsh"
    Command.Spec.(
      empty
      +> flag "-port" (optional_with_default 8765 int)
          ~doc:" Port to listen on (default 8765)"
    )
    (fun port () ->
       run_server ~port
    )
  |> Command.run
