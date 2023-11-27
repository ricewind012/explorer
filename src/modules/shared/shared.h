#include <node.h>
#include <source_location>

#define GO_AWAY(msg) ThrowException(pIsolate, msg); return
#define OBJ_MEMBER(k, v) obj->Set(context, ToString(pIsolate, k), v)

using namespace v8;

const char* ArgToString(Isolate* pIsolate, Local<Value> arg);
void ThrowException(
  Isolate* pIsolate,
  const char* szMessage,
	const std::source_location hLine = std::source_location::current()
);
Local<String> ToString(Isolate* pIsolate, const char* szString);
