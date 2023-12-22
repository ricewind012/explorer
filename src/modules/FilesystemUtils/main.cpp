#include <filesystem>
#include <vector>

#include "../shared/shared.h"

namespace fs = std::filesystem;

void
GetFiles(const FunctionCallbackInfo<Value>& args)
{
	auto* pIsolate = args.GetIsolate();
	auto context = pIsolate->GetCurrentContext();

	std::error_code err;
	std::vector<Local<Object>> vecPaths;

	String::Utf8Value js_strArg(pIsolate, args[0]);
	auto szArg = *js_strArg;

	for (const auto& i : fs::directory_iterator{ szArg, err }) {
		auto obj = Object::New(pIsolate);
		auto hFileStatus = fs::status(i.path());

		OBJ_MEMBER("path", TO_STRING(i.path().c_str()));
		OBJ_MEMBER("type", Number::New(pIsolate, (int)hFileStatus.type()));
		OBJ_MEMBER("mode", Number::New(pIsolate, (int)hFileStatus.permissions()));

		if (!i.is_directory()) {
			OBJ_MEMBER("size", Number::New(pIsolate, fs::file_size(i, err)));
		}

		vecPaths.push_back(obj);
	}

	if (err) {
		GO_AWAY(err.message().c_str());
	}

	auto unSize = vecPaths.size();
	auto result = Array::New(pIsolate, unSize);

	if (unSize == 0) {
		GO_AWAY("Empty directory");
	}

	if (result.IsEmpty()) {
		ThrowException(pIsolate, "result.IsEmpty()");
		args.GetReturnValue().Set(Local<Array>());
		return;
	}

	for (size_t i = 0; i < unSize; i++)
		result->Set(context, i, vecPaths.at(i));

	args.GetReturnValue().Set(result);
}

void
DiskUsage(const FunctionCallbackInfo<Value>& args)
{
	auto* pIsolate = args.GetIsolate();
	auto context = pIsolate->GetCurrentContext();
	auto obj = Object::New(pIsolate);

	String::Utf8Value js_strArg(pIsolate, args[0]);
	auto szArg = *js_strArg;

	std::error_code err;
	auto data = fs::space(szArg, err);

	if (err) {
		GO_AWAY(err.message().c_str());
	}

	OBJ_MEMBER("capacity", Number::New(pIsolate, data.capacity));
	OBJ_MEMBER("free", Number::New(pIsolate, data.free));
	OBJ_MEMBER("available", Number::New(pIsolate, data.available));

	args.GetReturnValue().Set(obj);
}

extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(Local<Object> exports, Local<Object> module)
{
	NODE_SET_METHOD(exports, "GetFiles", GetFiles);
	NODE_SET_METHOD(exports, "DiskUsage", DiskUsage);
}
