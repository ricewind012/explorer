#include <node.h>
#include <source_location>

using namespace v8;

const char* ArgToString(Isolate* pIsolate, Local<Value> arg) {
	String::Utf8Value js_str(pIsolate, arg);
	auto szResult(*js_str);

	return szResult;
}

Local<String> ToString(Isolate* pIsolate, const char* szString) {
	return String::NewFromUtf8(pIsolate, szString).ToLocalChecked();
}

void ThrowException(
	Isolate* pIsolate,
	const char* szMessage,
	const std::source_location hLine = std::source_location::current()
) {
	auto szLine = std::to_string(hLine.line()).c_str();
	auto szFile = basename(hLine.file_name());

	auto unLength = strlen(szFile) + strlen(szLine) + strlen(szMessage) + 3;
	char szOutput[unLength];

	strcpy(szOutput, szFile);
	strcat(szOutput, ":");
	strcat(szOutput, szLine);
	strcat(szOutput, ": ");
	strcat(szOutput, szMessage);

	pIsolate->ThrowException(Exception::Error(ToString(pIsolate, szOutput)));
}